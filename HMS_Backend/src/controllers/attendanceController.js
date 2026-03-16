const Attendance = require("../models/Attendance");
const Allocation = require("../models/Allocation");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Room = require("../models/Room");

exports.getAbsenteesByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }

    const targetDate = new Date(date);

    const records = await Attendance.find({
      date: targetDate,
      status: "absent",
    }).populate("student", "name email");

    const result = [];

    for (const r of records) {
      const profile = await Profile.findOne({ user: r.student._id });

      const allocation = await Allocation.findOne({
        student: r.student._id,
        isActive: true,
      }).populate("room", "roomNumber floor");

      result.push({
        student: r.student,
        profile,
        room: allocation?.room,
      });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { roomId, absentStudents, date } = req.body;

    if (!roomId || !date) {
      return res.status(400).json({ message: "roomId and date required" });
    }

    // get students in room
    const allocations = await Allocation.find({
      room: roomId,
      isActive: true,
    });

    const attendanceDate = new Date(date);

    for (const alloc of allocations) {
      const studentId = alloc.student;

      const isAbsent = absentStudents?.includes(studentId.toString());

      await Attendance.findOneAndUpdate(
        { student: studentId, date: attendanceDate },
        {
          student: studentId,
          date: attendanceDate,
          status: isAbsent ? "absent" : "present",
          markedBy: req.user._id,
        },
        { upsert: true }
      );
    }

    res.status(200).json({ message: "Room attendance saved" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};
