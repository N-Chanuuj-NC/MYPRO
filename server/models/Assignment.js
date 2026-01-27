const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true },

    title: { type: String, required: true, trim: true },
    instructions: { type: String, default: "", trim: true },
    dueDate: { type: Date, default: null },

    totalMarks: { type: Number, default: 100, min: 0 },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
