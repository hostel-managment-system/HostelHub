const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["present", "absent"],
      default: "present",
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// one record per day per student
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports =
  mongoose.models.Attendance ||
  mongoose.model("Attendance", attendanceSchema);
