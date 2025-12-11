const axios = require("axios");
<<<<<<< HEAD
const pool = require("../config/db"); 

// Live endpoints (free)
const METALS_LIVE_GOLD = "https://api.metals.live/v1/spot/gold";
const METALS_LIVE_SILVER = "https://api.metals.live/v1/spot/silver";
const FX_OPEN_API = "https://open.er-api.com/v6/latest/USD";

const GRAMS_IN_TROY_OUNCE = 31.1035;

function safeNumber(v, fb = null) {
  const n = Number(v);
  return isNaN(n) ? fb : n;
}

async function fetchUsdInr() {
  try {
    const r = await axios.get(FX_OPEN_API,{timeout:5000});
    return r.data?.rates?.INR || r.data?.conversion_rates?.INR || 83;
  } catch {
    return 83; // fallback
  }
}

async function fetchFromMetalsLive() {
  const g = await axios.get(METALS_LIVE_GOLD,{timeout:6000});
  const s = await axios.get(METALS_LIVE_SILVER,{timeout:6000});

  return {
    gold: { price: g.data[g.data.length-1][1] },
    silver:{ price:s.data[s.data.length-1][1] }
  };
}

exports.getUnlimitedLive = async(req,res)=>{
  console.log("\n🟡 /api/live called");

  let usdInr = await fetchUsdInr();
  let goldData=null,silverData=null;

  try{
    console.log("Trying Metals API...");
    const live = await fetchFromMetalsLive();
    goldData = live.gold;
    silverData=live.silver;
    console.log("Metals.live success");
  }catch(e){
    console.log("Metals API Failed:",e.message);
  }

  // If still no live — return fallback safe rates
  if(!goldData || !goldData.price || !silverData||!silverData.price){
    console.log("❗Using fallback safe pricing");

    return res.json({
      source:"fallback",
      usdInr,
      goldPerGram: (2250*usdInr/GRAMS_IN_TROY_OUNCE).toFixed(2),
      silverPerGram:(28*usdInr/31.1035).toFixed(2),

      gold:{
        sell24:6120,
        sell22:5600,
        sell18:4700
      },
      silver:{ sell:76 },

      products:[
        {name:"Gold 24K per gram",sell:6120},
        {name:"Gold 22K per gram",sell:5600},
        {name:"Gold 18K per gram",sell:4700},
        {name:"Silver 999 per gram",sell:76}
      ]
=======
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
>>>>>>> a6f6bdb5e7300150b861bc540ad9bc2fc8be77d4
    });
  }

  // If live values available
  let goldInr = goldData.price*usdInr/GRAMS_IN_TROY_OUNCE;
  let silverInr=silverData.price*usdInr/GRAMS_IN_TROY_OUNCE;

  let sell24=Number((goldInr+150).toFixed(2));
  let sell22=Number((sell24*(22/24)).toFixed(2));
  let sell18=Number((sell24*(18/24)).toFixed(2));
  let sellSilver=Number((silverInr+2).toFixed(2));

  return res.json({
    source:"live",
    usdInr,
    goldPerGram:sell24,
    silverPerGram:sellSilver,

    gold:{sell24,sell22,sell18},
    silver:{sell:sellSilver},

    products:[
      {name:"Gold 24K per gram",sell:sell24},
      {name:"Gold 22K per gram",sell:sell22},
      {name:"Gold 18K per gram",sell:sell18},
      {name:"Silver 999 per gram",sell:sellSilver}
    ]
  });
}
