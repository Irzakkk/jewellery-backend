const express = require("express");
const router = express.Router();

const { getLiveRates } = require("../controllers/unlimitedLiveController");

router.get("/", getLiveRates);

module.exports = router;
