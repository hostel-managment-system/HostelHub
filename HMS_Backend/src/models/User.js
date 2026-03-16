const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
  type: String,
  required: true,
},
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "warden", "student"],
      required: true,
    },

    hostelStatus: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    mustChangePassword: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.User ||
  mongoose.model("User", userSchema);
