const express = require("express");
const router = express.Router();
const { getSilverRate, updateSilverRate } = require("../controllers/silverController");

router.get("/", getSilverRate);
router.post("/update", updateSilverRate);

module.exports = router;
