const pool = require("../config/db");

exports.getTicker = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT message FROM ticker_messages ORDER BY id DESC LIMIT 10"
    );

    const tickerList = result.rows.map(row => row.message);

    res.json({ ticker: tickerList });
  } catch (err) {
    console.error("Ticker Fetch Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
