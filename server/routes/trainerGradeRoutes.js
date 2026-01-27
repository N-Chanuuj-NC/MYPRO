const express = require("express");
const router = express.Router();

const { protect, trainerOnly } = require("../middleware/auth");

const {
  getGradesByCourse,
  createOrUpdateGrade,
  deleteGrade,
} = require("../controllers/trainerGradeController");

router.get("/courses/:courseId/grades", protect, trainerOnly, getGradesByCourse);
router.post("/courses/:courseId/grades", protect, trainerOnly, createOrUpdateGrade);
router.delete("/grades/:gradeId", protect, trainerOnly, deleteGrade);

module.exports = router;
