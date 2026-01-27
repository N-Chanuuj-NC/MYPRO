const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");

function normalizeEnrollment(e) {
  return {
    _id: e._id,
    trainerId: e.trainerId,
    courseId: e.courseId,
    enrolledAt: e.enrolledAt,
    progressPercent: e.progressPercent,
    status: e.status,
    student: {
      _id: e.studentId?._id || e.studentId,
      name: e.studentId?.name || "Student",
      email: e.studentId?.email || "-",
    },
    profile: {
      fullName: e.studentId?.name || "Student",
    },
    createdAt: e.createdAt,
    updatedAt: e.updatedAt,
  };
}

// GET /api/trainer/courses/:courseId/enrollments
exports.getEnrollmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({ _id: courseId, trainerId: req.user.id });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const enrollments = await Enrollment.find({ trainerId: req.user.id, courseId })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      course: { _id: course._id, title: course.title },
      enrollments: enrollments.map(normalizeEnrollment),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/trainer/courses/:courseId/enrollments
// body: { studentEmail, progressPercent?, status? }
exports.createEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { studentEmail, progressPercent = 0, status = "active" } = req.body;

    if (!studentEmail) return res.status(400).json({ message: "studentEmail is required" });

    const course = await Course.findOne({ _id: courseId, trainerId: req.user.id });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const student = await User.findOne({ email: studentEmail.trim().toLowerCase() }).select(
      "name email"
    );
    if (!student) return res.status(404).json({ message: "Student not found. Create student first." });

    const p = Number(progressPercent);
    if (Number.isNaN(p) || p < 0 || p > 100) {
      return res.status(400).json({ message: "progressPercent must be 0-100" });
    }

    const allowed = ["active", "blocked", "completed"];
    if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });

    const created = await Enrollment.create({
      trainerId: req.user.id,
      courseId,
      studentId: student._id,
      progressPercent: p,
      status,
    });

    const populated = await Enrollment.findById(created._id).populate("studentId", "name email");
    res.status(201).json(normalizeEnrollment(populated));
  } catch (err) {
    // duplicate enrollment
    if (err.code === 11000) {
      return res.status(400).json({ message: "Student already enrolled in this course" });
    }
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/trainer/enrollments/:enrollmentId
exports.updateEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { progressPercent, status } = req.body;

    const enr = await Enrollment.findOne({ _id: enrollmentId, trainerId: req.user.id });
    if (!enr) return res.status(404).json({ message: "Enrollment not found" });

    if (progressPercent !== undefined) {
      const p = Number(progressPercent);
      if (Number.isNaN(p) || p < 0 || p > 100) {
        return res.status(400).json({ message: "progressPercent must be 0-100" });
      }
      enr.progressPercent = p;
    }

    if (status !== undefined) {
      const allowed = ["active", "blocked", "completed"];
      if (!allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });
      enr.status = status;
    }

    await enr.save();

    const populated = await Enrollment.findById(enr._id).populate("studentId", "name email");
    res.json(normalizeEnrollment(populated));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/trainer/enrollments/:enrollmentId
exports.deleteEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;

    const enr = await Enrollment.findOneAndDelete({ _id: enrollmentId, trainerId: req.user.id });
    if (!enr) return res.status(404).json({ message: "Enrollment not found" });

    res.json({ message: "Enrollment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
