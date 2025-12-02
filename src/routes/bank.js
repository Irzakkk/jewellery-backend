const express = require("express");
const router = express.Router();
const {
  getBankDetails,
  createBankDetail,
  updateBankDetail,
  deleteBankDetail,
} = require("../controllers/bankController");

router.get("/", getBankDetails);
router.post("/create", createBankDetail);
router.put("/update/:id", updateBankDetail);
router.delete("/delete/:id", deleteBankDetail);

module.exports = router;
