const express = require("express");
const router = express.Router();
const {
  createClickLog,
  getClickLogs
} = require("../controllers/clickController");

router.get("/", getClickLogs);
router.post("/create", createClickLog);

module.exports = router;
