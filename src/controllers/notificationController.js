const pool = require("../config/db");

exports.getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, metal, old_rate, new_rate, created_at FROM rate_notifications ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Server error" });
  }
};
