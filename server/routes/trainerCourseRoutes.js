const router = require("express").Router();
const { protect, trainerOnly } = require("../middleware/auth");
const {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublish,
} = require("../controllers/trainerCourseController");

router.use(protect, trainerOnly);

router.get("/courses", getCourses);
router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);
router.patch("/courses/:id/publish", togglePublish);

module.exports = router;
