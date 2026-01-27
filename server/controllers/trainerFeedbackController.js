const Course = require("../models/Course");
const Feedback = require("../models/Feedback");

// GET /api/trainer/courses/:courseId/feedback
exports.getFeedbackByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({ _id: courseId, trainerId: req.user.id });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const feedback = await Feedback.find({ trainerId: req.user.id, courseId })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      course: { _id: course._id, title: course.title },
      feedback,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/trainer/feedback/:id
exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { trainerReply, resolved } = req.body;

    const fb = await Feedback.findOne({ _id: id, trainerId: req.user.id });
    if (!fb) return res.status(404).json({ message: "Feedback not found" });

    if (trainerReply !== undefined) fb.trainerReply = String(trainerReply).trim();
    if (resolved !== undefined) fb.resolved = Boolean(resolved);

    await fb.save();
    res.json(fb);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/trainer/feedback/:id
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Feedback.findOneAndDelete({ _id: id, trainerId: req.user.id });
    if (!deleted) return res.status(404).json({ message: "Feedback not found" });

    res.json({ message: "Feedback deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
