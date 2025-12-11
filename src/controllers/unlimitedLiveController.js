// src/controllers/unlimitedLiveController.js
const axios = require("axios");
const cheerio = require("cheerio");

exports.getUnlimitedLive = async (req, res) => {
  try {
    // GOLD API (unlimited free)
    const goldApi = await axios.get("https://api.gold-api.com/price/XAU");
    const silverApi = await axios.get("https://api.gold-api.com/price/XAG");

    const usdInr = 89.95; // Replace later with FX API

    const goldUsd = goldApi.data.price;
    const silverUsd = silverApi.data.price;

    const gram = 31.1035;

    // Convert USD/oz → INR/g
    const goldInrPerGram = (goldUsd * usdInr) / gram;
    const silverInrPerGram = (silverUsd * usdInr) / gram;

    // Premiums
    const premiumGold = 150;
    const premiumSilver = 2;

    const gold24 = Math.round(goldInrPerGram + premiumGold);
    const gold22 = Math.round(gold24 * (22 / 24));
    const gold18 = Math.round(gold24 * (18 / 24));

    const silver999 = Math.round(silverInrPerGram + premiumSilver);

    return res.json({
      source: "gold-api.com",
      fetched_at: new Date().toISOString(),
      goldUsdPerOz: goldUsd,
      silverUsdPerOz: silverUsd,
      usdInr,
      gold: {
        sell24: gold24,
        sell22: gold22,
        sell18: gold18
      },
      silver: {
        sell: silver999
      },
      products: [
        { name: "Gold 24K per gram", sell: gold24 },
        { name: "Gold 22K per gram", sell: gold22 },
        { name: "Gold 18K per gram", sell: gold18 },
        { name: "Silver 999 per gram", sell: silver999 }
      ]
    });
  } catch (err) {
    console.error("Live API error:", err.message);
    return res.status(500).json({ error: "Live API failed", details: err.message });
  }
};
