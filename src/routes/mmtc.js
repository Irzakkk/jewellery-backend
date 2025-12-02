const express = require("express");
const router = express.Router();

// SAMPLE MMTC GOLD DATA (you can change values later)
const goldCoins = [
  { name: "MMTC GOLD COIN .500", rate: 6933 },
  { name: "MMTC GOLD COIN 1 GM SQUARE", rate: 13615 },
  { name: "MMTC GOLD COIN 2 GM", rate: 27010 },
  { name: "MMTC GOLD COIN 4 GM", rate: 53841 },
  { name: "MMTC GOLD COIN 5 GM", rate: 67376 },
  { name: "MMTC GOLD COIN 8 GM", rate: 107822 },
  { name: "MMTC PAMP 10 GM", rate: 134352 },
  { name: "MMTC GOLD COIN 20 GM", rate: 268554 },
  { name: "MMTC GOLD 50 GM", rate: 668660 },
  { name: "MMTC COINS 100 GM", rate: 1335520 },
  { name: "Kundan 1GM 9999 ROUND SHAPE", rate: 13565 }
];

// SAMPLE MMTC SILVER DATA
const silverCoins = [
  { name: "MMTC PAMP SILVER 999", rate: 186839 },
  { name: "MMTC SILVER 10 GM", rate: 2177 },
  { name: "MMTC SILVER 20 GM", rate: 4149 },
  { name: "MMTC SILVER 50 GM", rate: 10197 },
  { name: "MMTC SILVER 100 GM", rate: 20157 },
  { name: "MMTC SILVER 250 GM", rate: 49367 },
  { name: "MMTC SILVER 500 GM", rate: 96870 },
  { name: "MMTC SILVER 1 KG", rate: 191845 }
];

router.get("/gold", (req, res) => res.json(goldCoins));
router.get("/silver", (req, res) => res.json(silverCoins));

module.exports = router;
