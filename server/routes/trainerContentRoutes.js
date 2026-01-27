const router = require("express").Router();
const { protect, trainerOnly } = require("../middleware/auth");
const {
  getModules,
  createModule,
  deleteModule,
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  toggleLessonPublish,
} = require("../controllers/trainerContentController");

router.use(protect, trainerOnly);

// Modules
router.get("/courses/:courseId/modules", getModules);
router.post("/courses/:courseId/modules", createModule);
router.delete("/modules/:moduleId", deleteModule);

// Lessons
router.get("/modules/:moduleId/lessons", getLessons);
router.post("/modules/:moduleId/lessons", createLesson);
router.put("/lessons/:lessonId", updateLesson);
router.delete("/lessons/:lessonId", deleteLesson);
router.patch("/lessons/:lessonId/publish", toggleLessonPublish);

module.exports = router;
