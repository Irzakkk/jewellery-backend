const express = require("express");
const router = express.Router();
const {
  getCustomMessages,
  createCustomMessage,
  updateCustomMessage,
  deleteCustomMessage,
} = require("../controllers/customController");

router.get("/", getCustomMessages);
router.post("/create", createCustomMessage);
router.put("/update/:id", updateCustomMessage);
router.delete("/delete/:id", deleteCustomMessage);

module.exports = router;
