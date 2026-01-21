const { getMCXPrice } = require("../services/tradingViewSocket");

exports.getMCXGold = async (req, res) => {
  try {
    const data = await getMCXPrice("MCX:GOLD1!");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "MCX Gold fetch failed" });
  }
};

exports.getMCXSilver = async (req, res) => {
  try {
    const data = await getMCXPrice("MCX:SILVER1!");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "MCX Silver fetch failed" });
  }
};
