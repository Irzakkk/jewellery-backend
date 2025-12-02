const pool = require("../config/db");

// GET latest gold rate
exports.getGoldRate = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT rate, updated_at FROM gold_rates ORDER BY updated_at DESC LIMIT 1"
    );
    
    if (result.rows.length === 0) {
      return res.json({ rate: null });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching gold rate:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE gold rate
exports.updateGoldRate = async (req, res) => {
  try {
    const { rate } = req.body;

    if (!rate) return res.status(400).json({ error: "Rate is required" });

    // Get previous rate
    const prevResult = await pool.query(
      "SELECT rate FROM gold_rates ORDER BY updated_at DESC LIMIT 1"
    );

    const previousRate = prevResult.rows.length ? prevResult.rows[0].rate : null;

    // Insert new rate
    await pool.query(
      "INSERT INTO gold_rates (rate, updated_at) VALUES ($1, NOW())",
      [rate]
    );

    // If rate changed, insert notification
    if (previousRate !== null && previousRate !== rate) {
      await pool.query(
        "INSERT INTO rate_notifications (metal, old_rate, new_rate, created_at) VALUES ($1, $2, $3, NOW())",
        ["gold", previousRate, rate]
      );
    }

    res.json({ message: "Gold rate updated successfully" });
  } catch (error) {
    console.error("Error updating gold rate:", error);
    res.status(500).json({ error: "Server error" });
  }
};

