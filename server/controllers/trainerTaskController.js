const Lesson = require("../models/Lesson");
const Assignment = require("../models/Assignment");
const Quiz = require("../models/Quiz");

// validate lesson belongs to trainer
async function findTrainerLesson(lessonId, trainerId) {
  return Lesson.findOne({ _id: lessonId, trainerId });
}

/* -------------------- ASSIGNMENTS -------------------- */

// GET /api/trainer/lessons/:lessonId/assignments
exports.getAssignments = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await findTrainerLesson(lessonId, req.user.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const items = await Assignment.find({ lessonId, trainerId: req.user.id }).sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/trainer/lessons/:lessonId/assignments
exports.createAssignment = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, instructions, dueDate, totalMarks } = req.body;

    const lesson = await findTrainerLesson(lessonId, req.user.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    if (!title || !title.trim()) return res.status(400).json({ message: "Title is required" });

    const assignment = await Assignment.create({
      trainerId: req.user.id,
      courseId: lesson.courseId,
      moduleId: lesson.moduleId,
      lessonId: lesson._id,

      title: title.trim(),
      instructions: instructions || "",
      dueDate: dueDate ? new Date(dueDate) : null,
      totalMarks: Number(totalMarks || 100),
      status: "draft",
    });

    return res.status(201).json(assignment);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PATCH /api/trainer/assignments/:id/publish
exports.toggleAssignmentPublish = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findOne({ _id: id, trainerId: req.user.id });
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    assignment.status = assignment.status === "published" ? "draft" : "published";
    await assignment.save();

    return res.json(assignment);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/trainer/assignments/:id
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Assignment.findOneAndDelete({ _id: id, trainerId: req.user.id });
    if (!deleted) return res.status(404).json({ message: "Assignment not found" });

    return res.json({ message: "Assignment deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* -------------------- QUIZZES -------------------- */

// GET /api/trainer/lessons/:lessonId/quizzes
exports.getQuizzes = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await findTrainerLesson(lessonId, req.user.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const items = await Quiz.find({ lessonId, trainerId: req.user.id }).sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/trainer/lessons/:lessonId/quizzes
exports.createQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, timeLimitMinutes, totalMarks, questions } = req.body;

    const lesson = await findTrainerLesson(lessonId, req.user.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    if (!title || !title.trim()) return res.status(400).json({ message: "Title is required" });

    const quiz = await Quiz.create({
      trainerId: req.user.id,
      courseId: lesson.courseId,
      moduleId: lesson.moduleId,
      lessonId: lesson._id,

      title: title.trim(),
      timeLimitMinutes: Number(timeLimitMinutes || 10),
      totalMarks: Number(totalMarks || 100),
      status: "draft",
      questions: Array.isArray(questions) ? questions : [],
    });

    return res.status(201).json(quiz);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/trainer/quizzes/:id
exports.updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findOne({ _id: id, trainerId: req.user.id });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const { title, timeLimitMinutes, totalMarks, questions } = req.body;

    if (title !== undefined) quiz.title = title.trim();
    if (timeLimitMinutes !== undefined) quiz.timeLimitMinutes = Number(timeLimitMinutes);
    if (totalMarks !== undefined) quiz.totalMarks = Number(totalMarks);
    if (questions !== undefined) quiz.questions = Array.isArray(questions) ? questions : quiz.questions;

    await quiz.save();
    return res.json(quiz);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PATCH /api/trainer/quizzes/:id/publish
exports.toggleQuizPublish = async (req, res) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findOne({ _id: id, trainerId: req.user.id });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    quiz.status = quiz.status === "published" ? "draft" : "published";
    await quiz.save();

    return res.json(quiz);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/trainer/quizzes/:id
exports.deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Quiz.findOneAndDelete({ _id: id, trainerId: req.user.id });
    if (!deleted) return res.status(404).json({ message: "Quiz not found" });

    return res.json({ message: "Quiz deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
