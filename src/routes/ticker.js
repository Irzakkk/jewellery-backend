const express = require("express");
const router = express.Router();

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

module.exports = router;
