const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },

    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["video", "pdf", "link", "text"],
      default: "video",
    },

    resourceUrl: { type: String, default: "" }, // for video/pdf/link
    contentText: { type: String, default: "" }, // for text lesson
    durationMinutes: { type: Number, default: 0, min: 0 },

    status: { type: String, enum: ["draft", "published"], default: "draft" },
    order: { type: Number, default: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lesson", lessonSchema);
