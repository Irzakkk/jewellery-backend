const express = require("express");
const router = express.Router();
const { getTicker } = require("../controllers/tickerController");

router.get("/", getTicker);

module.exports = router;
