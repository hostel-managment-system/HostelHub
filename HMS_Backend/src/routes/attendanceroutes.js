const express = require("express");
const router = express.Router();

const { markAttendance,getAbsenteesByDate, getMyAttendance } = require("../controllers/attendanceController");
const { protect } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");

router.post("/", protect, allowRoles( "warden"), markAttendance);
router.get("/my", protect, allowRoles("student"), getMyAttendance);
router.get("/absent",protect,allowRoles("admin", "warden"),getAbsenteesByDate);

module.exports = router;
