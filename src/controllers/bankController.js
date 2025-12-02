const pool = require("../config/db");

// Get all bank details
exports.getBankDetails = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, bank_name, account_holder, account_number, ifsc, upi_id, created_at FROM bank_details ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching bank details:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Create bank detail
exports.createBankDetail = async (req, res) => {
  try {
    const { bank_name, account_holder, account_number, ifsc, upi_id } = req.body;

    if (!bank_name || !account_holder || !account_number || !ifsc) {
      return res.status(400).json({
        error: "bank_name, account_holder, account_number, and ifsc are required",
      });
    }

    await pool.query(
      "INSERT INTO bank_details (bank_name, account_holder, account_number, ifsc, upi_id, created_at) VALUES ($1, $2, $3, $4, $5, NOW())",
      [bank_name, account_holder, account_number, ifsc, upi_id || null]
    );

    res.json({ message: "Bank detail added successfully" });
  } catch (error) {
    console.error("Error creating bank detail:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update a bank detail
exports.updateBankDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { bank_name, account_holder, account_number, ifsc, upi_id } = req.body;

    await pool.query(
      "UPDATE bank_details SET bank_name = $1, account_holder = $2, account_number = $3, ifsc = $4, upi_id = $5 WHERE id = $6",
      [bank_name, account_holder, account_number, ifsc, upi_id || null, id]
    );

    res.json({ message: "Bank detail updated successfully" });
  } catch (error) {
    console.error("Error updating bank detail:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete bank detail
exports.deleteBankDetail = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM bank_details WHERE id = $1", [id]);

    res.json({ message: "Bank detail deleted successfully" });
  } catch (error) {
    console.error("Error deleting bank detail:", error);
    res.status(500).json({ error: "Server error" });
  }
};
