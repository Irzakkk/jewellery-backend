const pool = require("../config/db");

// Create a click log
exports.createClickLog = async (req, res) => {
  try {
    const { type } = req.body;

    if (!type)
      return res.status(400).json({ error: "Type is required" });

    await pool.query(
      "INSERT INTO click_logs (type, created_at) VALUES ($1, NOW())",
      [type]
    );

    res.json({ message: "Click logged successfully" });
  } catch (error) {
    console.error("Error creating click log:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all click logs
exports.getClickLogs = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, type, created_at FROM click_logs ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching click logs:", error);
    res.status(500).json({ error: "Server error" });
  }
};
