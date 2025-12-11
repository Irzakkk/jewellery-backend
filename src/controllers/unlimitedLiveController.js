const axios = require("axios");
const cheerio = require("cheerio");

// SCRAPER: TradingView HTML → Extract JSON
async function scrapeTradingView(symbol) {
  try {
    const url = `https://www.tradingview.com/symbols/MCX-${symbol}/`;

    const res = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36",
      },
    });

    const $ = cheerio.load(res.data);
    const jsonText = $("#__NEXT_DATA__").html();

    if (!jsonText) throw new Error("Missing TradingView data");

    const json = JSON.parse(jsonText);
    const price = json?.props?.pageProps?.symbolInfo?.lp;

    return price || null;
  } catch (err) {
    console.log("⚠ TradingView Scraper Error:", err.message);
    return null;
  }
}

// MAIN LIVE API CONTROLLER
exports.getLiveRates = async (req, res) => {
  try {
    console.log("🔄 Fetching MCX live rates...");

    // Scrape MCX Futures
    const goldMCX = await scrapeTradingView("GOLD1!");      // price per 10g
    const silverMCX = await scrapeTradingView("SILVER1!");  // price per 1kg

    if (!goldMCX || !silverMCX) {
      console.log("⚠ Using fallback because scraper failed");
      return res.json({
        source: "fallback",
        gold: {
          sell24: 6120,
          sell22: 5600,
          sell18: 4700,
        },
        silver: { sell: 76 },
        products: [
          { name: "Gold 24K per gram", sell: 6120 },
          { name: "Gold 22K per gram", sell: 5600 },
          { name: "Gold 18K per gram", sell: 4700 },
          { name: "Silver 999 per gram", sell: 76 },
        ],
        fetched_at: new Date(),
      });
    }

    console.log("📊 Raw MCX Gold (10g):", goldMCX);
    console.log("📊 Raw MCX Silver (1kg):", silverMCX);

    // Convert MCX values to per gram
    const goldPerGram = goldMCX / 10;       // MCX gold price is per 10g
    const silverPerGram = silverMCX / 1000; // MCX silver is per 1kg

    // Build JSON response
    const response = {
      source: "tradingview",
      gold: {
        sell24: Math.round(goldPerGram),
        sell22: Math.round(goldPerGram * 0.92), // standard purity conversion
        sell18: Math.round(goldPerGram * 0.75),
      },
      silver: {
        sell: Math.round(silverPerGram),
      },
      products: [
        { name: "Gold 24K per gram", sell: Math.round(goldPerGram) },
        { name: "Gold 22K per gram", sell: Math.round(goldPerGram * 0.92) },
        { name: "Gold 18K per gram", sell: Math.round(goldPerGram * 0.75) },
        { name: "Silver 999 per gram", sell: Math.round(silverPerGram) },
      ],
      fetched_at: new Date(),
    };

    console.log("✅ Sending live MCX rates");
    res.json(response);

  } catch (err) {
    console.log("❌ Ultimate Backend Error:", err);
    res.status(500).json({
      error: "Server failure",
      details: err.message,
    });
  }
};
