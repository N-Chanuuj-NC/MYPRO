const Course = require("../models/Course");
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");

// helper: check course belongs to trainer
async function ensureTrainerCourse(courseId, trainerId) {
  const course = await Course.findOne({ _id: courseId, trainerId });
  return course;
}

/* ---------------- MODULES ---------------- */

// GET /api/trainer/courses/:courseId/modules
exports.getModules = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await ensureTrainerCourse(courseId, req.user.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const modules = await Module.find({ courseId, trainerId: req.user.id }).sort({ order: 1 });
    return res.json(modules);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/trainer/courses/:courseId/modules
exports.createModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title } = req.body;

    const course = await ensureTrainerCourse(courseId, req.user.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Module title is required" });
    }

    const last = await Module.find({ courseId, trainerId: req.user.id }).sort({ order: -1 }).limit(1);
    const nextOrder = last.length ? last[0].order + 1 : 1;

    const mod = await Module.create({
      trainerId: req.user.id,
      courseId,
      title: title.trim(),
      order: nextOrder,
    });

    return res.status(201).json(mod);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/trainer/modules/:moduleId
exports.deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const mod = await Module.findOne({ _id: moduleId, trainerId: req.user.id });
    if (!mod) return res.status(404).json({ message: "Module not found" });

    // delete lessons under this module
    await Lesson.deleteMany({ moduleId: mod._id, trainerId: req.user.id });

    await mod.deleteOne();
    return res.json({ message: "Module deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ---------------- LESSONS ---------------- */

// GET /api/trainer/modules/:moduleId/lessons
exports.getLessons = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const mod = await Module.findOne({ _id: moduleId, trainerId: req.user.id });
    if (!mod) return res.status(404).json({ message: "Module not found" });

    const lessons = await Lesson.find({ moduleId, trainerId: req.user.id }).sort({ order: 1 });
    return res.json(lessons);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/trainer/modules/:moduleId/lessons
exports.createLesson = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, type, resourceUrl, contentText, durationMinutes } = req.body;

    const mod = await Module.findOne({ _id: moduleId, trainerId: req.user.id });
    if (!mod) return res.status(404).json({ message: "Module not found" });

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Lesson title is required" });
    }

    const last = await Lesson.find({ moduleId, trainerId: req.user.id }).sort({ order: -1 }).limit(1);
    const nextOrder = last.length ? last[0].order + 1 : 1;

    const lesson = await Lesson.create({
      trainerId: req.user.id,
      courseId: mod.courseId,
      moduleId: mod._id,
      title: title.trim(),
      type: type || "video",
      resourceUrl: resourceUrl || "",
      contentText: contentText || "",
      durationMinutes: Number(durationMinutes || 0),
      status: "draft",
      order: nextOrder,
    });

    return res.status(201).json(lesson);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/trainer/lessons/:lessonId
exports.updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findOne({ _id: lessonId, trainerId: req.user.id });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const { title, type, resourceUrl, contentText, durationMinutes, status, order } = req.body;

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ message: "Title cannot be empty" });
      lesson.title = title.trim();
    }
    if (type !== undefined) lesson.type = type;
    if (resourceUrl !== undefined) lesson.resourceUrl = resourceUrl;
    if (contentText !== undefined) lesson.contentText = contentText;
    if (durationMinutes !== undefined) lesson.durationMinutes = Number(durationMinutes);
    if (status !== undefined) lesson.status = status;
    if (order !== undefined) lesson.order = Number(order);

    await lesson.save();
    return res.json(lesson);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/trainer/lessons/:lessonId
exports.deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findOneAndDelete({ _id: lessonId, trainerId: req.user.id });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    return res.json({ message: "Lesson deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PATCH /api/trainer/lessons/:lessonId/publish
exports.toggleLessonPublish = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findOne({ _id: lessonId, trainerId: req.user.id });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    lesson.status = lesson.status === "published" ? "draft" : "published";
    await lesson.save();

    return res.json(lesson);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
