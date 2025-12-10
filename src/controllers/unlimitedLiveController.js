const axios = require("axios");
const GRAMS_PER_OUNCE = 31.1035;

const LIVE_URL = "https://data-asg.goldprice.org/dbXRates/USD"; // source

exports.getUnlimitedLive = async (req, res) => {
  try {
    const r = await axios.get(LIVE_URL, { timeout: 5000 });
    const d = r.data.items[0];

    const usdInr = 83; // later we automate INR fetch

    const goldPerGram = (d.xauPrice * usdInr) / GRAMS_PER_OUNCE;
    const silverPerGram = (d.xagPrice * usdInr) / GRAMS_PER_OUNCE;

    const gold24 = Math.round(goldPerGram + 100);
    const gold22 = Math.round(gold24 * 0.916);
    const gold18 = Math.round(gold24 * 0.750);
    const silver = Math.round(silverPerGram + 2);

    return res.json({
      source:"live",
      usdInr,
      gold:{ sell24:gold24, sell22:gold22, sell18:gold18 },
      silver:{ sell:silver },
      products:[
        { name:"Gold 24K per gram", sell:gold24 },
        { name:"Gold 22K per gram", sell:gold22 },
        { name:"Gold 18K per gram", sell:gold18 },
        { name:"Silver 999 per gram", sell:silver }
      ]
    });

  } catch (err) {
    console.log("⚠ Live API failed → sending fallback");

    // SAFE fallback that won't break UI
    return res.json({
      source:"fallback",
      usdInr:83,
      gold:{ sell24:6120, sell22:5600, sell18:4700 },
      silver:{ sell:76 },
      products:[
        { name:"Gold 24K per gram", sell:6120 },
        { name:"Gold 22K per gram", sell:5600 },
        { name:"Gold 18K per gram", sell:4700 },
        { name:"Silver 999 per gram", sell:76 }
      ]
    });
  }
}
