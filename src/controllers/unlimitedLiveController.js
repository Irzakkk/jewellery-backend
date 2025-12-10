const axios = require("axios");
const pool = require("../config/db");

const SOURCE_API = "https://data-asg.goldprice.org/dbXRates/USD";
const GRAMS_PER_OUNCE = 31.1035;

exports.getUnlimitedLive = async(req,res)=>{
  try{
    const fxInr = 1; // already USD base, INR conversion below

    const r = await axios.get(SOURCE_API, {timeout:5000});
    const d = r.data.items[0];

    const usdInr = 83; // manually set / or you can add INR Fetch later

    const goldUsd = d.xauPrice;
    const silverUsd = d.xagPrice;

    const goldPerGram = (goldUsd * usdInr) / GRAMS_PER_OUNCE;
    const silverPerGram = (silverUsd * usdInr) / GRAMS_PER_OUNCE;

    const final24 = Math.round(goldPerGram + 100);
    const final22 = Math.round(final24 * 0.916);
    const final18 = Math.round(final24 * 0.750);
    const silverFinal = Math.round(silverPerGram + 2);

    const payload ={
      source:"goldprice.org",
      usdInr,
      gold:{sell24:final24, sell22:final22, sell18:final18},
      silver:{sell:silverFinal},
      products:[
        {name:"Gold 24K per gram", sell:final24},
        {name:"Gold 22K per gram", sell:final22},
        {name:"Gold 18K per gram", sell:final18},
        {name:"Silver 999 per gram", sell:silverFinal}
      ]
    };

    return res.json(payload);

  }catch(err){
    return res.json({error:"Fallback", details:err.message});
  }
}
