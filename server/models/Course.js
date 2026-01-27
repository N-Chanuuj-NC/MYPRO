const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true, trim: true },
    category: { type: String, default: "General", trim: true },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },

    price: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    description: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
