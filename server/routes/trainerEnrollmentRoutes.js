const express = require("express");
const router = express.Router();

const { protect, trainerOnly } = require("../middleware/auth");

const {
  getEnrollmentsByCourse,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
} = require("../controllers/trainerEnrollmentController");

// ✅ All trainer protected routes
router.get(
  "/courses/:courseId/enrollments",
  protect,
  trainerOnly,
  getEnrollmentsByCourse
);

router.post(
  "/courses/:courseId/enrollments",
  protect,
  trainerOnly,
  createEnrollment
);

router.put(
  "/enrollments/:enrollmentId",
  protect,
  trainerOnly,
  updateEnrollment
);

router.delete(
  "/enrollments/:enrollmentId",
  protect,
  trainerOnly,
  deleteEnrollment
);

module.exports = router;
