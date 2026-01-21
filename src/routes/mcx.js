const express = require("express");
const router = express.Router();
const { getMCXGold, getMCXSilver } = require("../controllers/mcxController");

router.get("/gold", getMCXGold);
router.get("/silver", getMCXSilver);

module.exports = router;
