const Room = require("../models/Room");
const Hostel = require("../models/hostel");

exports.createRoom = async (req, res) => {
  try {
    const { hostelId, floor, roomNumber, capacity } = req.body;

    // hostel must exist
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    // optional: prevent duplicate room
    const existing = await Room.findOne({ hostel: hostelId, roomNumber });
    if (existing) {
      return res.status(400).json({ message: "Room already exists" });
    }
    
    const room = await Room.create({
      hostel: hostelId,
      floor,
      roomNumber,
      capacity,
    });

    res.status(201).json({
      message: "Room created",
      room,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getRooms = async (req, res) => {
  try {
    const { hostelId, all } = req.query;
    const filter = (all === 'true') ? {} : { isActive: true };
    if (hostelId) {
      filter.hostel = hostelId;
    }

    const rooms = await Room.find(filter).populate("hostel", "name");
    const result = rooms.map((room) => ({
      ...room.toObject(),
      vacancy: room.capacity - room.occupied,
      status: room.occupied >= room.capacity ? "full" : "available",
    }));

    res.status(200).json({
      count: result.length,
      rooms: result,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.toggleRoomActive = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    room.isActive = !room.isActive;
    await room.save();

    res.status(200).json({
      message: `Room ${room.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: room.isActive,
    });
  } catch (error) {
    console.error("TOGGLE ROOM ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

