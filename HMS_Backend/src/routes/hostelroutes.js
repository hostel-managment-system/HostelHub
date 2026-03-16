const express = require("express");
const router = express.Router();

const { createHostel, getHostels } = require("../controllers/hostelController");
const { protect } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");




router.post("/", protect, allowRoles("admin"), createHostel);
router.get("/",getHostels);


module.exports = router;
