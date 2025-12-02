const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin } = require("../controllers/adminController");

// TEMPORARY: Register admin (we remove later)
router.post("/register", registerAdmin);

// Login route
router.post("/login", loginAdmin);

module.exports = router;
