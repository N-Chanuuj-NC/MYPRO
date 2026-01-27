const express = require("express");
const router = express.Router();
const { protect, trainerOnly } = require("../middleware/auth");

const { getTrainerDashboardSummary } = require("../controllers/trainerDashboardController");

router.get("/dashboard/summary", protect, trainerOnly, getTrainerDashboardSummary);

module.exports = router;
