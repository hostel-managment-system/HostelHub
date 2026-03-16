const Hostel = require("../models/hostel");
const Room = require("../models/Room");

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
    const hostels = await Hostel.find({ isActive: true });

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


