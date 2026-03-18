const mongoose = require("mongoose");

const hostelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    gender: {
      type: String,
      enum: ["boys", "girls", "mixed"],
      required: true,
    },

    totalFloors: {
      type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Hostel || mongoose.model("Hostel", hostelSchema);


