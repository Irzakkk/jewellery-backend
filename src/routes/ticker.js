const express = require("express");
const router = express.Router();
<<<<<<< HEAD

router.get("/", (req, res) => {
  res.json({
    ticker: [
      { label: "GOLD 24K", value: "₹6120", direction: "up" },
      { label: "SILVER", value: "₹76", direction: "down" },
      { label: "USD-INR", value: "83.10", direction: "up" },
      { label: "GOLD FUTURE", value: "130655", direction: "down" }
    ]
  });
});
=======
const { getTicker } = require("../controllers/tickerController");

router.get("/", getTicker);
>>>>>>> 74fd3b458da801509adbd6327921070077fb45d4

module.exports = router;
