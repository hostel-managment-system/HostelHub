const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    allocatedAt: {
      type: Date,
      default: Date.now,
    },

    vacatedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Allocation ||
  mongoose.model("Allocation", allocationSchema);
