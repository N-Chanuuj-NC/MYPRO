const Course = require("../models/Course");

// GET /api/trainer/courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ trainerId: req.user.id }).sort({
      createdAt: -1,
    });
    return res.json(courses);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/trainer/courses
exports.createCourse = async (req, res) => {
  try {
    const { title, category, level, price, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const course = await Course.create({
      trainerId: req.user.id,
      title: title.trim(),
      category: category?.trim() || "General",
      level: level || "beginner",
      price: Number(price || 0),
      description: description?.trim() || "",
      status: "draft",
    });

    return res.status(201).json(course);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PUT /api/trainer/courses/:id
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findOne({ _id: id, trainerId: req.user.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const { title, category, level, price, description, status } = req.body;

    if (title !== undefined) {
      if (!title.trim()) return res.status(400).json({ message: "Title cannot be empty" });
      course.title = title.trim();
    }
    if (category !== undefined) course.category = category.trim();
    if (level !== undefined) course.level = level;
    if (price !== undefined) course.price = Number(price);
    if (description !== undefined) course.description = description.trim();
    if (status !== undefined) course.status = status;

    await course.save();
    return res.json(course);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// DELETE /api/trainer/courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findOneAndDelete({
      _id: id,
      trainerId: req.user.id,
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    return res.json({ message: "Course deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// PATCH /api/trainer/courses/:id/publish
exports.togglePublish = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findOne({ _id: id, trainerId: req.user.id });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.status = course.status === "published" ? "draft" : "published";
    await course.save();

    return res.json(course);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
