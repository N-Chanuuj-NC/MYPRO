const router = require("express").Router();
const { protect, trainerOnly } = require("../middleware/auth");
const {
  getAssignments,
  createAssignment,
  toggleAssignmentPublish,
  deleteAssignment,
  getQuizzes,
  createQuiz,
  updateQuiz,
  toggleQuizPublish,
  deleteQuiz,
} = require("../controllers/trainerTaskController");

router.use(protect, trainerOnly);

// Assignments
router.get("/lessons/:lessonId/assignments", getAssignments);
router.post("/lessons/:lessonId/assignments", createAssignment);
router.patch("/assignments/:id/publish", toggleAssignmentPublish);
router.delete("/assignments/:id", deleteAssignment);

// Quizzes
router.get("/lessons/:lessonId/quizzes", getQuizzes);
router.post("/lessons/:lessonId/quizzes", createQuiz);
router.put("/quizzes/:id", updateQuiz);
router.patch("/quizzes/:id/publish", toggleQuizPublish);
router.delete("/quizzes/:id", deleteQuiz);

module.exports = router;
