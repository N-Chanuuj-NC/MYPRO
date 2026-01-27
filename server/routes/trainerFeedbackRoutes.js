const express = require("express");
const router = express.Router();

const { protect, trainerOnly } = require("../middleware/auth");
const {
  getFeedbackByCourse,
  updateFeedback,
  deleteFeedback,
} = require("../controllers/trainerFeedbackController");

router.get("/courses/:courseId/feedback", protect, trainerOnly, getFeedbackByCourse);
router.patch("/feedback/:id", protect, trainerOnly, updateFeedback);
router.delete("/feedback/:id", protect, trainerOnly, deleteFeedback);

module.exports = router;
