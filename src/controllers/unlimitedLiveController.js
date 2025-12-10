// backend/src/controllers/unlimitedLiveController.js
const axios = require("axios");
const pool = require("../config/db"); // if you ever want caching later

const GOLD_API_GOLD = "https://api.gold-api.com/price/XAU";
const GOLD_API_SILVER = "https://api.gold-api.com/price/XAG";
const FX_OPEN_API = "https://open.er-api.com/v6/latest/USD";

const GRAMS_IN_TROY_OUNCE = 31.1035;

// Margins / premiums (you said "keep values as is")
const GOLD_PREMIUM_PER_GRAM = 200;
const GOLD_MAKING_PER_GRAM = 50;
const SILVER_PREMIUM_PER_GRAM = 3;
const SILVER_MAKING_PER_GRAM = 0;

function safeNumber(v, fb = null) {
  const n = Number(v);
  return isNaN(n) ? fb : n;
}

async function fetchUsdInr() {
  try {
    const resp = await axios.get(FX_OPEN_API, { timeout: 5000 });
    const inr =
      resp.data?.rates?.INR ||
      resp.data?.conversion_rates?.INR ||
      resp.data?.INR;

    return safeNumber(inr, 83);
  } catch (err) {
    console.warn("FX fetch failed, using fallback 83:", err.message || err);
    return 83;
  }
}

async function fetchGoldPriceAPI() {
  const [goldRes, silverRes] = await Promise.all([
    axios.get(GOLD_API_GOLD, { timeout: 5000 }),
    axios.get(GOLD_API_SILVER, { timeout: 5000 }),
  ]);

  return {
    goldUsd: safeNumber(goldRes.data.price),
    silverUsd: safeNumber(silverRes.data.price),
    updatedAt: goldRes.data.updatedAt,
    updatedAtReadable: goldRes.data.updatedAtReadable,
  };
}

exports.getUnlimitedLive = async (req, res) => {
  try {
    console.log("🟡 /api/live called");

    const usdInr = await fetchUsdInr();

    const { goldUsd, silverUsd, updatedAt, updatedAtReadable } =
      await fetchGoldPriceAPI();

    if (!goldUsd || !silverUsd) {
      throw new Error("Gold or Silver USD price missing from gold-api.com");
    }

    // Convert USD/oz → INR/gram
    const goldInrPerGram =
      (goldUsd * usdInr) / GRAMS_IN_TROY_OUNCE;
    const silverInrPerGram =
      (silverUsd * usdInr) / GRAMS_IN_TROY_OUNCE;

    // Apply your margins
    const gold24 =
      goldInrPerGram +
      GOLD_PREMIUM_PER_GRAM +
      GOLD_MAKING_PER_GRAM;
    const gold22 = gold24 * (22 / 24);
    const gold18 = gold24 * (18 / 24);

    const silverFinal =
      silverInrPerGram +
      SILVER_PREMIUM_PER_GRAM +
      SILVER_MAKING_PER_GRAM;

    const gold24Rounded = Math.round(gold24);
    const gold22Rounded = Math.round(gold22);
    const gold18Rounded = Math.round(gold18);
    const silverRounded = Math.round(silverFinal);

    const payload = {
      source: "gold-api.com",
      usdInr,
      goldUsdPerOz: goldUsd,
      silverUsdPerOz: silverUsd,
      updatedAt,
      updatedAtReadable,
      gold: {
        perGramRawINR: Number(goldInrPerGram.toFixed(2)),
        sell24: gold24Rounded,
        sell22: gold22Rounded,
        sell18: gold18Rounded,
      },
      silver: {
        perGramRawINR: Number(silverInrPerGram.toFixed(2)),
        sell: silverRounded,
      },
      products: [
        { name: "Gold 24K per gram", sell: gold24Rounded },
        { name: "Gold 22K per gram", sell: gold22Rounded },
        { name: "Gold 18K per gram", sell: gold18Rounded },
        { name: "Silver 999 per gram", sell: silverRounded },
      ],
      fetched_at: new Date().toISOString(),
    };

    return res.json(payload);
  } catch (err) {
    console.warn("⚠ Live API failed → sending fallback:", err.message || err);

    // SAFE fallback: same shape, no crash
    const fallbackGold24 = 6120;
    const fallbackGold22 = 5600;
    const fallbackGold18 = 4700;
    const fallbackSilver = 76;

    return res.json({
      source: "fallback",
      usdInr: 83,
      goldUsdPerOz: null,
      silverUsdPerOz: null,
      updatedAt: null,
      updatedAtReadable: null,
      gold: {
        perGramRawINR: null,
        sell24: fallbackGold24,
        sell22: fallbackGold22,
        sell18: fallbackGold18,
      },
      silver: {
        perGramRawINR: null,
        sell: fallbackSilver,
      },
      products: [
        { name: "Gold 24K per gram", sell: fallbackGold24 },
        { name: "Gold 22K per gram", sell: fallbackGold22 },
        { name: "Gold 18K per gram", sell: fallbackGold18 },
        { name: "Silver 999 per gram", sell: fallbackSilver },
      ],
      fetched_at: new Date().toISOString(),
      error: err.message || String(err),
    });
  }
};

