const axios = require("axios");

const TROY_OUNCE = 31.1034768;

const PREMIUM_GOLD_PER_GRAM = Number(process.env.PREMIUM_GOLD_PER_GRAM || 100);
const PREMIUM_SILVER_PER_GRAM = Number(process.env.PREMIUM_SILVER_PER_GRAM || 2);
const MAKING_CHARGE_PER_GRAM = Number(process.env.MAKING_CHARGE_PER_GRAM || 0);

exports.getLiveRates = async (req, res) => {
  try {
    // 1️⃣ Fetch gold & silver spot
    const [goldRes, silverRes, fxRes] = await Promise.all([
      axios.get("https://api.gold-api.com/price/XAU"),
      axios.get("https://api.gold-api.com/price/XAG"),
      axios.get("https://api.frankfurter.dev/v1/latest?base=USD"),
    ]);

    const goldUsdPerOz = goldRes.data.price;
    const silverUsdPerOz = silverRes.data.price;
    const usdInr = fxRes.data.rates.INR;

    // 2️⃣ Convert to INR per gram
    const goldPerGramRaw = (goldUsdPerOz * usdInr) / TROY_OUNCE;
    const silverPerGramRaw = (silverUsdPerOz * usdInr) / TROY_OUNCE;

    // 3️⃣ Apply premium logic (MCX-style)
    const gold24 = Math.round(goldPerGramRaw + PREMIUM_GOLD_PER_GRAM + MAKING_CHARGE_PER_GRAM);
    const gold22 = Math.round(gold24 * 0.916);
    const gold18 = Math.round(gold24 * 0.75);

    const silver999 = Math.round(silverPerGramRaw + PREMIUM_SILVER_PER_GRAM);

    return res.json({
      source: "gold-api.com + frankfurter.dev",
      fetched_at: new Date().toISOString(),

      usdInr,

      goldUsdPerOz,
      silverUsdPerOz,

      gold: {
        sell24: gold24,
        sell22: gold22,
        sell18: gold18,
        perGramRawINR: Number(goldPerGramRaw.toFixed(2)),
      },

      silver: {
        sell: silver999,
        perGramRawINR: Number(silverPerGramRaw.toFixed(2)),
      },

      products: [
        { name: "Gold 24K per gram", sell: gold24 },
        { name: "Gold 22K per gram", sell: gold22 },
        { name: "Gold 18K per gram", sell: gold18 },
        { name: "Silver 999 per gram", sell: silver999 },
      ],
    });

  } catch (err) {
    console.error("Live rate error:", err.message);
    res.status(500).json({ error: "Live pricing failed" });
  }
};
