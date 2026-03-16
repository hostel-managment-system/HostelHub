const Profile = require("../models/Profile");
const Allocation = require("../models/Allocation");
const Room = require("../models/Room");

exports.getMyProfile = async (req, res) => {

  try {
    const userId = req.user._id;

    console.log("GET PROFILE FOR:", userId); //helps debugging

    const profile = await Profile.findOne({ user: userId })
      .populate("user", "name email role hostelStatus");

    if (!profile) {
      return res.status(404).json({
        message: "Profile not found for this user",
        userId,
      });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.upsertProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // whitelist allowed fields
    const { name, phone, address, department, year, roll } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        name,
        phone,
        address,
        department,
        year,
        roll,
      },
      { new: true, upsert: true }
    ).populate("user", "email role hostelStatus");

    res.status(200).json({
      message: "Profile saved",
      profile,
    });
  } catch (error) {
    console.error("UPSERT PROFILE ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};



exports.getStudents = async (req, res) => {
  try {
    const { year, department, hostelId } = req.query;

    if (!hostelId) {
      return res.status(400).json({ message: "hostelId is required" });
    }

    const yearFilter = year && year !== "all";
    const deptFilter = department && department !== "all";

    const rooms = await Room.find({ hostel: hostelId });
    const roomIds = rooms.map((r) => r._id);

    const allocations = await Allocation.find({
      room: { $in: roomIds },
      isActive: true,
    })
      .populate("student", "email role hostelStatus")
      .populate("room", "roomNumber floor");

    const result = await Promise.all(
      allocations.map(async (alloc) => {
        if (alloc.student.role !== "student") return null;

        const profile = await Profile.findOne({
          user: alloc.student._id,
        });

        if (
          (yearFilter && profile?.year !== Number(year)) ||
          (deptFilter && profile?.department !== department)
        ) {
          return null;
        }

        return {
          user: alloc.student,
          profile,
          room: alloc.room,
        };
      })
    );

    res.status(200).json(result.filter(Boolean));
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};
