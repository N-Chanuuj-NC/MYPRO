const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/authMiddleware');

// @route   GET api/student/courses (For CourseLibrary.jsx)
router.get('/courses', auth, studentController.getAllCourses);

// @route   GET api/student/enrolled (For StudentHome.jsx)
router.get('/enrolled', auth, studentController.getEnrolledCourses);

// @route   POST api/student/enroll (For CourseDetails.jsx)
router.post('/enroll', auth, studentController.enrollInCourse);

// @route   GET api/student/lessons/:id (For LessonViewer.jsx)
router.get('/lessons/:id', auth, studentController.getLessonContent);

// @route   POST api/student/feedback (For StudentFeedback.jsx)
router.post('/feedback', auth, studentController.submitFeedback);

// @route   PUT api/student/profile (For ProfileSettings.jsx)
router.put('/profile', auth, studentController.updateProfile);

module.exports = router;
