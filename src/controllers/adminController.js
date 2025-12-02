const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register admin (we use manually once)
exports.registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Username and password required" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO admin_users (username, password, created_at) VALUES ($1, $2, NOW())",
      [username, hashedPassword]
    );

    res.json({ message: "Admin registered successfully" });
  } catch (error) {
    console.error("Error registering admin:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Login admin
exports.loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM admin_users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ error: "Invalid username or password" });

    const admin = result.rows[0];

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch)
      return res.status(400).json({ error: "Invalid username or password" });

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error logging in admin:", error);
    res.status(500).json({ error: "Server error" });
  }
};
