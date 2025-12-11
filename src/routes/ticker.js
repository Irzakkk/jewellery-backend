const express = require("express");
const router = express.Router();
const { getTicker } = require("../controllers/tickerController");

// route
router.get("/", getTicker);

module.exports = router;
