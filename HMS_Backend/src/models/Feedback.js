const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["complaint", "suggestion", "other"],
      default: "other",
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Feedback ||
  mongoose.model("Feedback", feedbackSchema);
