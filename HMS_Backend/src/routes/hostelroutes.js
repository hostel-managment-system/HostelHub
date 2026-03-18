const express = require("express");
const router = express.Router();

const { createHostel, getHostels, deleteHostel, resetHostel, toggleHostelActive } = require("../controllers/hostelController");
const { protect } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");

router.post("/", protect, allowRoles("admin"), createHostel);
router.get("/", getHostels);
router.delete("/:id", protect, allowRoles("admin"), deleteHostel);
router.post("/:id/reset", protect, allowRoles("admin"), resetHostel);
router.patch("/:id/toggle-active", protect, allowRoles("admin"), toggleHostelActive);

module.exports = router;
