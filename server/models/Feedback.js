const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },

    // If your student is stored in User, use "User". If you have separate Student model, change it.
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", trim: true },

    trainerReply: { type: String, default: "", trim: true },
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);
