const Hostel = require("../models/hostel");
const Room = require("../models/Room");
const Allocation = require("../models/Allocation");
const User = require("../models/User");
const AllocationRequest = require("../models/AllocationRequest");

exports.createHostel = async (req, res) => {
  try {
    const { name, gender, totalFloors } = req.body;

    const existing = await Hostel.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Hostel already exists" });
    }

    const hostel = await Hostel.create({
      name,
      gender,
      totalFloors,
    });

    res.status(201).json({
      message: "Hostel created",
      hostel,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// list all hostels
exports.getHostels = async (req, res) => {
  try {
    const { all } = req.query;
    const filter = (all === 'true') ? {} : { isActive: true };
    const hostels = await Hostel.find(filter);

    const result = [];

    for (const hostel of hostels) {
      const rooms = await Room.find({ hostel: hostel._id, isActive: true });

      const totalRooms = rooms.length;
      const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0);
      const totalOccupied = rooms.reduce((sum, r) => sum + r.occupied, 0);

      result.push({
        ...hostel.toObject(),
        totalRooms,
        totalCapacity,
        totalOccupied,
      });
    }

    res.status(200).json({
      count: result.length,
      hostels: result,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteHostel = async (req, res) => {
  try {
    const { id } = req.params;

    const hostel = await Hostel.findById(id);
    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    // 1. Find all rooms
    const rooms = await Room.find({ hostel: id });
    const roomIds = rooms.map(r => r._id);

    // 2. Find active allocations for these rooms and reset student status
    const allocations = await Allocation.find({ room: { $in: roomIds } });
    const studentIds = allocations.map(a => a.student);

    if (studentIds.length > 0) {
      await User.updateMany(
        { _id: { $in: studentIds } },
        { $set: { hostelStatus: "pending" } }
      );
    }

    // 3. Delete cascading data
    await Promise.all([
      Allocation.deleteMany({ room: { $in: roomIds } }),
      AllocationRequest.deleteMany({ room: { $in: roomIds } }),
      Room.deleteMany({ hostel: id }),
      Hostel.findByIdAndDelete(id)
    ]);

    res.status(200).json({ message: "Hostel and all associated data deleted successfully" });
  } catch (error) {
    console.error("DELETE HOSTEL ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetHostel = async (req, res) => {
  try {
    const { id } = req.params;

    const hostel = await Hostel.findById(id);
    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    // 1. Find all rooms
    const rooms = await Room.find({ hostel: id });
    const roomIds = rooms.map(r => r._id);

    // 2. Find active allocations and reset student status
    const allocations = await Allocation.find({ room: { $in: roomIds }, isActive: true });
    const studentIds = allocations.map(a => a.student);

    if (studentIds.length > 0) {
      // Clear student status
      await User.updateMany(
        { _id: { $in: studentIds } },
        { $set: { hostelStatus: "pending" } }
      );
    }

    // 3. Clear allocations and room occupancy
    await Promise.all([
      Allocation.deleteMany({ room: { $in: roomIds } }),
      AllocationRequest.deleteMany({ room: { $in: roomIds } }),
      Room.updateMany(
        { hostel: id },
        { $set: { occupied: 0 } }
      )
    ]);

    res.status(200).json({ message: "Hostel reset successfully. All rooms are now empty." });
  } catch (error) {
    console.error("RESET HOSTEL ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.toggleHostelActive = async (req, res) => {
  try {
    const { id } = req.params;
    const hostel = await Hostel.findById(id);
    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    hostel.isActive = !hostel.isActive;
    await hostel.save();

    res.status(200).json({
      message: `Hostel ${hostel.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: hostel.isActive,
    });
  } catch (error) {
    console.error("TOGGLE HOSTEL ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


