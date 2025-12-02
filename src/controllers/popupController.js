const pool = require("../config/db");

// Get all popup messages
exports.getPopupMessages = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, message, image_url, video_url, is_active, created_at FROM popup_messages ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching popup messages:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Create popup message
exports.createPopupMessage = async (req, res) => {
  try {
    const { title, message, image_url, video_url } = req.body;

    if (!title || !message)
      return res.status(400).json({ error: "Title and message are required" });

    await pool.query(
      "INSERT INTO popup_messages (title, message, image_url, video_url, is_active, created_at) VALUES ($1, $2, $3, $4, TRUE, NOW())",
      [title, message, image_url || null, video_url || null]
    );

    res.json({ message: "Popup message created successfully" });
  } catch (error) {
    console.error("Error creating popup message:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update popup message
exports.updatePopupMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, image_url, video_url, is_active } = req.body;

    await pool.query(
      "UPDATE popup_messages SET title = $1, message = $2, image_url = $3, video_url = $4, is_active = $5 WHERE id = $6",
      [title, message, image_url || null, video_url || null, is_active, id]
    );

    res.json({ message: "Popup message updated successfully" });
  } catch (error) {
    console.error("Error updating popup message:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete popup message
exports.deletePopupMessage = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM popup_messages WHERE id = $1", [id]);

    res.json({ message: "Popup message deleted successfully" });
  } catch (error) {
    console.error("Error deleting popup message:", error);
    res.status(500).json({ error: "Server error" });
  }
};
