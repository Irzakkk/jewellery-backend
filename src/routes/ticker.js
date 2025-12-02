const express = require("express");
const router = express.Router();
const {
  getTickerMessages,
  createTickerMessage,
  updateTickerMessage,
  deleteTickerMessage,
} = require("../controllers/tickerController");

router.get("/", getTickerMessages);
router.post("/create", createTickerMessage);
router.put("/update/:id", updateTickerMessage);
router.delete("/delete/:id", deleteTickerMessage);

module.exports = router;
