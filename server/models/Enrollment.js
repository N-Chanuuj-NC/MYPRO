const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    status: { type: String, enum: ["active", "blocked", "completed"], default: "active" },

    enrolledAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// prevent duplicate enrollments
enrollmentSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
