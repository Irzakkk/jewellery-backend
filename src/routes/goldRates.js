const express = require("express");
const router = express.Router();
const { getGoldRate, updateGoldRate } = require("../controllers/goldController");

router.get("/", getGoldRate);
router.post("/update", updateGoldRate);

module.exports = router;
