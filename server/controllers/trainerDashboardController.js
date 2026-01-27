const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Assignment = require("../models/Assignment");
const Quiz = require("../models/Quiz");
const Feedback = require("../models/Feedback");
const Grade = require("../models/Grade");

exports.getTrainerDashboardSummary = async (req, res) => {
  try {
    const trainerId = req.user.id;

    // 1) Courses
    const courses = await Course.find({ trainerId }).sort({ createdAt: -1 }).lean();
    const courseIds = courses.map((c) => c._id);

    // 2) Enrollments
    const enrollments = await Enrollment.find({ trainerId, courseId: { $in: courseIds } })
      .populate("studentId", "name email")
      .populate("courseId", "title")
      .sort({ createdAt: -1 })
      .lean();

    // total enrolled (unique students or total enrollments?)
    const totalEnrolled = enrollments.length;

    // 3) “Pending submissions” (simple proxy)
    // If you don’t have submissions table yet, we approximate with:
    // assignments + quizzes created but not graded (grades missing)
    const grades = await Grade.find({ trainerId }).lean();
    const gradedKeys = new Set(grades.map((g) => `${g.studentId}_${g.courseId}`));

    // pending = active enrollments where grade not created yet
    const pendingEnrollments = enrollments.filter((e) => {
      const key = `${e.studentId?._id || e.studentId}_${e.courseId?._id || e.courseId}`;
      return !gradedKeys.has(key);
    });

    const pendingSubmissionsCount = pendingEnrollments.length;

    // 4) Avg rating from feedback
    const feedbacks = await Feedback.find({ trainerId })
      .populate("studentId", "name")
      .populate("courseId", "title")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const allFeedback = await Feedback.find({ trainerId }).lean();
    const avgRating =
      allFeedback.length === 0
        ? 0
        : Number(
            (
              allFeedback.reduce((sum, f) => sum + (Number(f.rating) || 0), 0) / allFeedback.length
            ).toFixed(1)
          );

    // 5) “Today” section (simple tips based on counts)
    // If you later add due dates, we’ll improve this.
    const today = {
      quizzesScheduled: await Quiz.countDocuments({ trainerId }),
      pendingSubmissions: pendingSubmissionsCount,
    };

    // 6) Recent pending list (top 5)
    const recentPending = pendingEnrollments.slice(0, 5).map((e) => ({
      studentName: e.studentId?.name || "Student",
      courseTitle: e.courseId?.title || "Course",
      task: "Grade Pending",
      status: "Pending",
    }));

    // 7) Latest feedback (already limited)
    const latestFeedback = feedbacks.map((f) => ({
      studentName: f.studentId?.name || "Student",
      courseTitle: f.courseId?.title || "Course",
      rating: f.rating,
      comment: f.comment || "",
    }));

    res.json({
      cards: {
        myCourses: courses.length,
        totalEnrolled,
        pendingSubmissions: pendingSubmissionsCount,
        avgRating,
      },
      today,
      recentPending,
      latestFeedback,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
