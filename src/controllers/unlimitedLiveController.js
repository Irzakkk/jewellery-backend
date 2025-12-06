// src/controllers/unlimitedLiveController.js
const axios = require("axios");
const pool = require("../config/db"); // your existing Pool instance

const GRAMS_IN_TROY_OUNCE = 31.1035;

const GOLDAPI_URL_XAU = "https://www.goldapi.io/api/XAU/USD";
const GOLDAPI_URL_XAG = "https://www.goldapi.io/api/XAG/USD";

const METALS_LIVE_GOLD = "https://api.metals.live/v1/spot/gold";
const METALS_LIVE_SILVER = "https://api.metals.live/v1/spot/silver";
const FX_OPEN_API = "https://open.er-api.com/v6/latest/USD";

function safeNumber(v, fallback = null) {
  if (v === undefined || v === null) return fallback;
  const n = Number(v);
  return isNaN(n) ? fallback : n;
}

async function fetchUsdInr() {
  try {
    const resp = await axios.get(FX_OPEN_API, { timeout: 5000 });
    if (resp.data && resp.data.result === "success") {
      const inr = safeNumber(resp.data.rates?.INR || resp.data.conversion_rates?.INR);
      if (inr) return inr;
    }
    // fallback try other fields if structure differs
    if (resp.data && resp.data.rates && resp.data.rates.INR) return safeNumber(resp.data.rates.INR);
  } catch (err) {
    console.warn("FX fetch failed:", err.message || err);
  }
  return null;
}

async function fetchFromGoldAPI(key) {
  try {
    const headers = key ? { "x-access-token": key } : {};
    const [gx, sx] = await Promise.all([
      axios.get(GOLDAPI_URL_XAU, { headers, timeout: 6000 }),
      axios.get(GOLDAPI_URL_XAG, { headers, timeout: 6000 }),
    ]);
    return {
      gold: gx.data,
      silver: sx.data,
    };
  } catch (err) {
    // bubble up so caller can fallback
    throw err;
  }
}

async function fetchFromMetalsLive() {
  try {
    // metals.live returns arrays; take last item
    const [gResp, sResp] = await Promise.all([
      axios.get(METALS_LIVE_GOLD, { timeout: 6000 }),
      axios.get(METALS_LIVE_SILVER, { timeout: 6000 }),
    ]);
    // example response: [ [timestamp, price], ... ]
    const gArr = Array.isArray(gResp.data) ? gResp.data : [];
    const sArr = Array.isArray(sResp.data) ? sResp.data : [];
    const goldUsd = gArr.length ? safeNumber(gArr[gArr.length - 1][1]) : null;
    const silverUsd = sArr.length ? safeNumber(sArr[sArr.length - 1][1]) : null;
    return {
      gold: { price: goldUsd },
      silver: { price: silverUsd },
    };
  } catch (err) {
    throw err;
  }
}

function gramFromOunceUsd(usdPerOunce, usdInr) {
  if (!usdPerOunce || !usdInr) return null;
  return (usdPerOunce * usdInr) / GRAMS_IN_TROY_OUNCE;
}

function buildProductsFromRates(gram24k, gram22k, gram18k, opts = {}) {
  // simple product examples, extend later
  return [
    { name: "Gold 24K (per gram)", sell: Number((gram24k).toFixed(2)) },
    { name: "Gold 22K (per gram)", sell: Number((gram22k).toFixed(2)) },
    { name: "Gold 18K (per gram)", sell: Number((gram18k).toFixed(2)) },
    { name: "Silver (per gram)", sell: Number((opts.silverPerGram || 0).toFixed(2)) },
  ];
}

async function upsertCache(key, payload) {
  if (!pool) return;
  try {
    await pool.query(
      `INSERT INTO cached_rates (id, payload, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
      [key, payload]
    );
  } catch (err) {
    console.warn("Cache upsert failed:", err.message || err);
  }
}

exports.getUnlimitedLive = async (req, res) => {
  try {
    // load env premiums
    const PREMIUM_GOLD_PER_GRAM = Number(process.env.PREMIUM_GOLD_PER_GRAM || 100);
    const PREMIUM_SILVER_PER_GRAM = Number(process.env.PREMIUM_SILVER_PER_GRAM || 2);
    const MAKING_CHARGE_PER_GRAM = Number(process.env.MAKING_CHARGE_PER_GRAM || 0);
    const CACHE_KEY = process.env.CACHE_KEY || "live_rates";

    // 1) get FX first
    const usdInr = await fetchUsdInr();

    // 2) attempt GoldAPI if key provided else fallback
    let sourceUsed = null;
    let goldData = null;
    let silverData = null;

    if (process.env.GOLDAPI_KEY) {
      try {
        const both = await fetchFromGoldAPI(process.env.GOLDAPI_KEY);
        goldData = both.gold;
        silverData = both.silver;
        sourceUsed = "goldapi";
      } catch (err) {
        console.warn("GoldAPI failed, will fallback to metals.live:", err.message || err);
      }
    }

    if (!goldData || !silverData) {
      // fallback to metals.live (unlimited, free)
      try {
        const both2 = await fetchFromMetalsLive();
        goldData = both2.gold;
        silverData = both2.silver;
        sourceUsed = "metals.live";
      } catch (err) {
        console.warn("metals.live failed:", err.message || err);
      }
    }

    // If still no data -> try external simple endpoints or return cached
    if ((!goldData || !goldData.price) && (!silverData || !silverData.price)) {
      // Try to return cached value if present
      try {
        const cached = await pool.query("SELECT payload FROM cached_rates WHERE id=$1", [CACHE_KEY]);
        if (cached.rows.length) {
          return res.json({ fromCache: true, ...cached.rows[0].payload });
        }
      } catch (err) {
        // ignore
      }
      return res.status(500).json({ error: "Unable to fetch gold/silver rates from upstream" });
    }

    // Extract USD/ounce values
    const goldUsdPerOz = safeNumber(goldData.price || goldData.price_oz || goldData.price_ounce || goldData.ask || goldData.bid);
    const silverUsdPerOz = safeNumber(silverData.price || silverData.price_oz || silverData.price_ounce || silverData.ask || silverData.bid);

    if (!usdInr) {
      // try alternative FX quick fetch
      console.warn("USD->INR fetch failed; setting usdInr=83 as fallback");
    }
    const usdInrUsed = usdInr || Number(process.env.FALLBACK_USD_INR || 83);

    // compute per gram (USD->INR)
    const goldInrPerGramRaw = gramFromOunceUsd(goldUsdPerOz, usdInrUsed);
    const silverInrPerGramRaw = gramFromOunceUsd(silverUsdPerOz, usdInrUsed);

    // if goldData includes price_gram_24k in USD already (GoldAPI returns it), use that to be precise
    let goldGram24Usd = null;
    if (goldData && goldData.price_gram_24k) goldGram24Usd = safeNumber(goldData.price_gram_24k);
    // convert it:
    let gold24Inr = goldGram24Usd ? (goldGram24Usd * usdInrUsed) : goldInrPerGramRaw;
    // compute derived karats proportionally if not provided
    let gold22Inr = gold24Inr ? gold24Inr * (22 / 24) : (goldInrPerGramRaw ? goldInrPerGramRaw * (22 / 24) : null);
    let gold18Inr = gold24Inr ? gold24Inr * (18 / 24) : (goldInrPerGramRaw ? goldInrPerGramRaw * (18 / 24) : null);

    // apply premiums/making charges
    const gold24Final = gold24Inr ? Number((gold24Inr + PREMIUM_GOLD_PER_GRAM + MAKING_CHARGE_PER_GRAM).toFixed(2)) : null;
    const gold22Final = gold22Inr ? Number((gold22Inr + PREMIUM_GOLD_PER_GRAM + MAKING_CHARGE_PER_GRAM).toFixed(2)) : null;
    const gold18Final = gold18Inr ? Number((gold18Inr + PREMIUM_GOLD_PER_GRAM + MAKING_CHARGE_PER_GRAM).toFixed(2)) : null;

    // silver: if API returns price per ounce, use that
    const silverPerGramInrRaw = silverInrPerGramRaw;
    const silverFinal = silverPerGramInrRaw ? Number((silverPerGramInrRaw + PREMIUM_SILVER_PER_GRAM + MAKING_CHARGE_PER_GRAM).toFixed(2)) : null;

    // Build response object
    const payload = {
      source: sourceUsed,
      usdInr: usdInrUsed,
      goldUsdPerOz,
      silverUsdPerOz,
      gold: {
        perGramRawINR: Number((gold24Inr || 0).toFixed(2)),
        perGram24k: gold24Inr ? Number(gold24Inr.toFixed(2)) : null,
        perGram22k: gold22Inr ? Number(gold22Inr.toFixed(2)) : null,
        perGram18k: gold18Inr ? Number(gold18Inr.toFixed(2)) : null,
        sell24: gold24Final,
        sell22: gold22Final,
        sell18: gold18Final
      },
      silver: {
        perGramRawINR: silverPerGramInrRaw ? Number(silverPerGramInrRaw.toFixed(2)) : null,
        sell: silverFinal
      },
      products: buildProductsFromRates(gold24Final, gold22Final, gold18Final, { silverPerGram: silverFinal }),
      fetched_at: new Date().toISOString()
    };

    // upsert cache asynchronously (don't wait)
    upsertCache(CACHE_KEY, payload).catch(() => {});

    return res.json(payload);
  } catch (err) {
    console.error("Unlimited live controller error:", err);
    return res.status(500).json({ error: "Server error", details: err.message || err });
  }
};
