const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    taskType: { type: String, enum: ["assignment", "quiz"], required: true },
    taskModel: { type: String, enum: ["Assignment", "Quiz"], required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "taskModel" },

    // assignment submission content
    answerText: { type: String, default: "" },
    fileUrl: { type: String, default: "" },

    // quiz submission content
    quizAnswers: { type: Array, default: [] },

    totalMarks: { type: Number, default: 100, min: 0 },
    marksObtained: { type: Number, default: 0, min: 0 },
    feedback: { type: String, default: "" },

    status: { type: String, enum: ["submitted", "graded"], default: "submitted" },
    submittedAt: { type: Date, default: Date.now },
    gradedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
