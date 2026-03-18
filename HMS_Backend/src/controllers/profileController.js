const Profile = require("../models/Profile");
const Allocation = require("../models/Allocation");
const Room = require("../models/Room");

exports.getMyProfile = async (req, res) => {

  try {
    const userId = req.user._id;

    let profile = await Profile.findOne({ user: userId })
      .populate("user", "name email role hostelStatus");

    if (!profile) {
      const User = require("../models/User");
      const user = await User.findById(userId).select("name email role hostelStatus");
      return res.status(200).json({
        user: userId,
        name: user?.name || "",
        email: user?.email || "",
        hostelStatus: user?.hostelStatus || "pending",
        phone: "",
        address: "",
        department: "",
        year: "",
        roll: "",
      });
    }

    // Flatten user fields for frontend ease
    const profileObj = profile.toObject();
    if (profile.user) {
      profileObj.name = profile.user.name;
      profileObj.email = profile.user.email;
      profileObj.hostelStatus = profile.user.hostelStatus;
    }

    res.status(200).json(profileObj);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.upsertProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // whitelist allowed fields
    const { phone, address, department, year, roll } = req.body;

    const profile = await Profile.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        phone,
        address,
        department,
        year,
        roll,
      },
      { new: true, upsert: true }
    ).populate("user", "name email role hostelStatus");

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
    const { year, department, hostelId, roomId } = req.query;
    const yearFilter = year && year !== "all" && year !== "";
    const deptFilter = department && department !== "all" && department !== "";
    let allocationsQuery = [];

    const query = { isActive: true };
    if (roomId) {
      query.room = roomId;
    } else if (hostelId) {
      const rooms = await Room.find({ hostel: hostelId });
      query.room = { $in: rooms.map(r => r._id) };
    }

    allocationsQuery = await Allocation.find(query)
      .populate("student", "name email role hostelStatus")
      .populate("room", "roomNumber floor");

    const result = await Promise.all(
      allocationsQuery.map(async (alloc) => {
        if (!alloc.student || alloc.student.role !== "student") return null;

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
          student: alloc.student,
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

exports.getMyAllocation = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Find the current active allocation
    const allocation = await Allocation.findOne({ student: userId, isActive: true })
      .populate({
        path: 'room',
        populate: { path: 'hostel', select: 'name gender' }
      });

    if (!allocation) {
      return res.status(200).json({ allocated: false });
    }

    // 2. Find roommates (others in the same room)
    const roommatesAlloc = await Allocation.find({ 
      room: allocation.room._id, 
      student: { $ne: userId },
      isActive: true 
    }).populate('student', 'name email');

    const roommates = roommatesAlloc.map(a => a.student);

    res.status(200).json({
      allocated: true,
      room: allocation.room,
      roommates
    });
  } catch (error) {
    console.error("GET ALLOCATION ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
