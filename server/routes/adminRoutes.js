const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');

// @route   GET api/admin/users  (For ManageUsers.jsx)
router.get('/users', auth, adminController.getUsers);
router.put('/users/:id', auth, adminController.updateUserStatus);

// @route   GET api/admin/courses (For ManageCourses.jsx)
router.get('/courses', auth, adminController.getAllCourses);

// @route   GET api/admin/reports (For Reports.jsx)
router.get('/reports', auth, adminController.getSystemReports);

// @route   PUT api/admin/settings (For Settings.jsx)
router.put('/settings', auth, adminController.updateSettings);

module.exports = router;
