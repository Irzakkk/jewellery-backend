const pool = require("../config/db");

// Get all active ticker messages
exports.getTickerMessages = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, message, is_active, created_at FROM ticker_messages ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching ticker messages:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Create new ticker message
exports.createTickerMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: "Message is required" });

    await pool.query(
      "INSERT INTO ticker_messages (message, is_active, created_at) VALUES ($1, TRUE, NOW())",
      [message]
    );

    res.json({ message: "Ticker message created successfully" });
  } catch (error) {
    console.error("Error creating ticker message:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update ticker message
exports.updateTickerMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, is_active } = req.body;

    await pool.query(
      "UPDATE ticker_messages SET message = $1, is_active = $2 WHERE id = $3",
      [message, is_active, id]
    );

    res.json({ message: "Ticker message updated successfully" });
  } catch (error) {
    console.error("Error updating ticker message:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete ticker message
exports.deleteTickerMessage = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM ticker_messages WHERE id = $1", [id]);

    res.json({ message: "Ticker message deleted successfully" });
  } catch (error) {
    console.error("Error deleting ticker message:", error);
    res.status(500).json({ error: "Server error" });
  }
};
