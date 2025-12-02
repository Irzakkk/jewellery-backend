const express = require("express");
const router = express.Router();
const {
  getPopupMessages,
  createPopupMessage,
  updatePopupMessage,
  deletePopupMessage,
} = require("../controllers/popupController");

router.get("/", getPopupMessages);
router.post("/create", createPopupMessage);
router.put("/update/:id", updatePopupMessage);
router.delete("/delete/:id", deletePopupMessage);

module.exports = router;
