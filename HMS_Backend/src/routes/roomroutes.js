const express = require("express");
const router = express.Router();

const { createRoom, getRooms, toggleRoomActive } = require("../controllers/roomController");
const { protect } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");

// infrastructure → admin
router.post("/", protect, allowRoles("admin"), createRoom);
router.get("/",getRooms);
router.patch("/:id/toggle-active", protect, allowRoles("admin"), toggleRoomActive);

module.exports = router;
