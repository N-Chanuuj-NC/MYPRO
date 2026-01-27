const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Grade = require("../models/Grade");

// GET /api/trainer/courses/:courseId/grades
exports.getGradesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({ _id: courseId, trainerId: req.user.id });
    if (!course) return res.status(404).json({ message: "Course not found" });

    // enrollments for this course
    const enrollments = await Enrollment.find({ trainerId: req.user.id, courseId })
  .populate("studentId", "name email")   // ✅ this is the fix
  .sort({ createdAt: -1 });


    // all grades for course
    const grades = await Grade.find({ trainerId: req.user.id, courseId });

    // map grades by studentId
    const map = new Map();
    grades.forEach((g) => map.set(String(g.studentId), g));

    // merge enrollments + grade (student info is stored in enrollment response usually)
    const rows = enrollments.map((e) => {
      const g = map.get(String(e.studentId)) || null;

      return {
        enrollmentId: e._id,
        studentId: e.studentId?._id || e.studentId,
        // ✅ now student info comes from populated studentId
        student: e.studentId
        ? { name: e.studentId.name, email: e.studentId.email }
        : null,
        profile: e.profile || null,
        // if your Enrollment stores profile
        progressPercent: e.progressPercent || 0,
        enrollmentStatus: e.status || "active",

        grade: g
          ? {
              _id: g._id,
              assignmentScore: g.assignmentScore,
              quizScore: g.quizScore,
              finalScore: g.finalScore,
              remarks: g.remarks,
              status: g.status,
              createdAt: g.createdAt,
              updatedAt: g.updatedAt,
            }
          : null,
      };
    });

    res.json({
      course: { _id: course._id, title: course.title },
      rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/trainer/courses/:courseId/grades
// body: { studentId, assignmentScore, quizScore, finalScore, remarks, status }
exports.createOrUpdateGrade = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { studentId, assignmentScore, quizScore, finalScore, remarks, status } = req.body;

    if (!studentId) return res.status(400).json({ message: "studentId is required" });

    const course = await Course.findOne({ _id: courseId, trainerId: req.user.id });
    if (!course) return res.status(404).json({ message: "Course not found" });

    // validate enrollment exists for that student in that course
    const enr = await Enrollment.findOne({ trainerId: req.user.id, courseId, studentId });
    if (!enr) return res.status(400).json({ message: "Student not enrolled in this course" });

    const safeNum = (v) => {
      const n = Number(v);
      if (Number.isNaN(n)) return 0;
      return Math.max(0, Math.min(100, n));
    };

    const updated = await Grade.findOneAndUpdate(
      { trainerId: req.user.id, courseId, studentId },
      {
        trainerId: req.user.id,
        courseId,
        studentId,
        assignmentScore: safeNum(assignmentScore),
        quizScore: safeNum(quizScore),
        finalScore: safeNum(finalScore),
        remarks: (remarks || "").trim(),
        status: status || "graded",
      },
      { upsert: true, new: true }
    );

    res.json(updated);
  } catch (err) {
    // duplicate unique index case
    if (err.code === 11000) {
      return res.status(400).json({ message: "Grade already exists for this student & course" });
    }
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/trainer/grades/:gradeId
exports.deleteGrade = async (req, res) => {
  try {
    const { gradeId } = req.params;

    const deleted = await Grade.findOneAndDelete({ _id: gradeId, trainerId: req.user.id });
    if (!deleted) return res.status(404).json({ message: "Grade not found" });

    res.json({ message: "Grade deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};