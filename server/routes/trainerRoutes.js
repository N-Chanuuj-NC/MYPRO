const express = require('express');
const router = express.Router();

const { protect, trainerOnly } = require('../middleware/auth');

const trainerCourseRoutes = require('./trainerCourseRoutes');
const trainerContentRoutes = require('./trainerContentRoutes');
const trainerTaskRoutes = require('./trainerTaskRoutes');
const trainerEnrollmentRoutes = require('./trainerEnrollmentRoutes');
const trainerGradeRoutes = require('./trainerGradeRoutes');
const trainerFeedbackRoutes = require('./trainerFeedbackRoutes');
const trainerDashboardRoutes = require('./trainerDashboardRoutes');
const trainerProfileRoutes = require('./trainerProfileRoutes');
const trainerStudentCrudRoutes = require('./trainerStudentCrudRoutes');
const trainerTestRoutes = require('./trainerTestRoutes');

// All trainer APIs require auth + trainer role
router.use(protect, trainerOnly);

router.use(trainerCourseRoutes);
router.use(trainerContentRoutes);
router.use(trainerTaskRoutes);
router.use(trainerEnrollmentRoutes);
router.use(trainerGradeRoutes);
router.use(trainerFeedbackRoutes);
router.use(trainerDashboardRoutes);
router.use(trainerProfileRoutes);
router.use(trainerStudentCrudRoutes);
router.use(trainerTestRoutes);

module.exports = router;
