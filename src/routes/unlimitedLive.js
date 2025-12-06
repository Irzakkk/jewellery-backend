// src/routes/unlimitedLive.js
const express = require("express");
const router = express.Router();
const { getUnlimitedLive } = require("../controllers/unlimitedLiveController");
router.get("/", getUnlimitedLive);
module.exports = router;
