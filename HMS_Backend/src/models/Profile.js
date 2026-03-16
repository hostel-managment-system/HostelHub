const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one profile per user
    },

    roll: String,
    department: String,
    year: Number,
    phone: String,
    address: String,
    parentContact: String,
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Profile ||
  mongoose.model("Profile", profileSchema);
