const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },

    // this should match your enrollment student reference type
    studentId: { type: mongoose.Schema.Types.ObjectId, required: true },

    assignmentScore: { type: Number, default: 0, min: 0, max: 100 },
    quizScore: { type: Number, default: 0, min: 0, max: 100 },
    finalScore: { type: Number, default: 0, min: 0, max: 100 },

    remarks: { type: String, default: "", trim: true },
    status: { type: String, enum: ["pending", "graded"], default: "pending" },
  },
  { timestamps: true }
);

// one grade record per student per course
gradeSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Grade", gradeSchema);
