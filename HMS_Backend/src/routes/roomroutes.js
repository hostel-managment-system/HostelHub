const express = require("express");
const router = express.Router();

const { createRoom,getRooms } = require("../controllers/roomController");
const { protect } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");

// infrastructure → admin
router.post("/", protect, allowRoles("admin"), createRoom);
router.get("/",getRooms);

module.exports = router;
