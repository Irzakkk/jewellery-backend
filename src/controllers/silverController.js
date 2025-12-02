const pool = require("../config/db");

// GET latest silver rate
exports.getSilverRate = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT rate, updated_at FROM silver_rates ORDER BY updated_at DESC LIMIT 1"
    );

    if (result.rows.length === 0) {
      return res.json({ rate: null });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching silver rate:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE silver rate
exports.updateSilverRate = async (req, res) => {
  try {
    const { rate } = req.body;

    if (!rate) return res.status(400).json({ error: "Rate is required" });

    // Get previous rate
    const prevResult = await pool.query(
      "SELECT rate FROM silver_rates ORDER BY updated_at DESC LIMIT 1"
    );

    const previousRate = prevResult.rows.length ? prevResult.rows[0].rate : null;

    // Insert new rate
    await pool.query(
      "INSERT INTO silver_rates (rate, updated_at) VALUES ($1, NOW())",
      [rate]
    );

    // If rate changed, insert notification
    if (previousRate !== null && previousRate !== rate) {
      await pool.query(
        "INSERT INTO rate_notifications (metal, old_rate, new_rate, created_at) VALUES ($1, $2, $3, NOW())",
        ["silver", previousRate, rate]
      );
    }

    res.json({ message: "Silver rate updated successfully" });
  } catch (error) {
    console.error("Error updating silver rate:", error);
    res.status(500).json({ error: "Server error" });
  }
};

