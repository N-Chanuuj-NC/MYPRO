const express = require("express");
const router = express.Router();

const { protect, trainerOnly } = require("../middleware/auth");
const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/trainerProfileController");

router.get("/profile", protect, trainerOnly, getProfile);
router.put("/profile", protect, trainerOnly, updateProfile);
router.patch("/profile/password", protect, trainerOnly, changePassword);

module.exports = router;
