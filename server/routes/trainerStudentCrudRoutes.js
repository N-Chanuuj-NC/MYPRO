const router = require("express").Router();
const { protect, trainerOnly } = require("../middleware/auth");

const {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/trainerStudentCrudController");

router.use(protect, trainerOnly);

router.get("/students", listStudents);
router.get("/students/:studentId", getStudent);
router.post("/students", createStudent);
router.put("/students/:studentId", updateStudent);
router.delete("/students/:studentId", deleteStudent);

module.exports = router;
