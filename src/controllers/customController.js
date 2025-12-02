const pool = require("../config/db");

// Get all custom messages
exports.getCustomMessages = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, content, type, created_at FROM custom_messages ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching custom messages:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Create custom message
exports.createCustomMessage = async (req, res) => {
  try {
    const { content, type } = req.body;

    if (!content || !type)
      return res.status(400).json({ error: "Content and type are required" });

    await pool.query(
      "INSERT INTO custom_messages (content, type, created_at) VALUES ($1, $2, NOW())",
      [content, type]
    );

    res.json({ message: "Custom message created successfully" });
  } catch (error) {
    console.error("Error creating custom message:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update custom message
exports.updateCustomMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type } = req.body;

    await pool.query(
      "UPDATE custom_messages SET content = $1, type = $2 WHERE id = $3",
      [content, type, id]
    );

    res.json({ message: "Custom message updated successfully" });
  } catch (error) {
    console.error("Error updating custom message:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete custom message
exports.deleteCustomMessage = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM custom_messages WHERE id = $1", [id]);

    res.json({ message: "Custom message deleted successfully" });
  } catch (error) {
    console.error("Error deleting custom message:", error);
    res.status(500).json({ error: "Server error" });
  }
};
