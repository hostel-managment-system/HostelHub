const AllocationRequest = require("../models/AllocationRequest");
const Allocation = require("../models/Allocation");
const Room = require("../models/Room");
const User = require("../models/User");
const Profile = require("../models/Profile");

const bcrypt = require("bcryptjs");

exports.createRequest = async (req, res) => {
  try {
    const { name, email, phone, year, roomId, transactionId } = req.body;

    if (!name || !email || !phone || !year || !roomId || !transactionId) {
      return res.status(400).json({ message: "All fields required" });
    }

    // check duplicate pending using email
    const existing = await AllocationRequest.findOne({
      email,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({ message: "Request already pending" });
    }

    await AllocationRequest.create({
      name,
      email,
      phone,
      year,
      room: roomId,
      transactionId,
    });

    res.status(201).json({ message: "Application submitted" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const request = await AllocationRequest.findById(req.params.id);

    if (!request || request.status !== "pending") {
      return res.status(400).json({ message: "Invalid request" });
    }

    const room = await Room.findById(request.room);

    if (!room || !room.isActive) {
      return res.status(400).json({ message: "Room unavailable" });
    }

    if (room.occupied >= room.capacity) {
      return res.status(400).json({ message: "Room full" });
    }

    // check if user already exists
    const userExists = await User.findOne({ email: request.email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // create default password
    const hashedPassword = await bcrypt.hash("123456", 10);

    // create user
  const newUser = await User.create({
  name: request.name,
  email: request.email,
  password: hashedPassword,
  role: "student",
  hostelStatus: "approved",
});


    // create allocation
    await Allocation.create({
      student: newUser._id,
      room: room._id,
    });

    // update occupancy
    room.occupied += 1;
    await room.save();

    // mark request
    request.status = "approved";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    await request.save();

    res.status(200).json({
      message: "Approved. Account created. Default password: 123456",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};


exports.rejectRequest = async (req, res) => {
  try {
    const request = await AllocationRequest.findById(req.params.id);

    if (!request || request.status !== "pending") {
      return res.status(400).json({ message: "Invalid request" });
    }

    request.status = "rejected";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();

    await request.save();

    res.status(200).json({ message: "Rejected" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};
