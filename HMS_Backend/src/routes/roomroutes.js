const express = require("express");
const router = express.Router();

const { createRoom, getRooms, toggleRoomActive, deleteRoom } = require("../controllers/roomController");
const { protect } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");

// infrastructure → admin
router.post("/", protect, allowRoles("admin"), createRoom);
router.get("/",getRooms);
router.patch("/:id/toggle-active", protect, allowRoles("admin"), toggleRoomActive);
router.delete("/:id", protect, allowRoles("admin"), deleteRoom);

module.exports = router;
