const express = require("express");
const router = express.Router();

const {
  createRequest,
  approveRequest,
  rejectRequest,
} = require("../controllers/requestController");
const { protect } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");

// public application
router.post("/", createRequest);
// authority
router.post("/:id/approve", protect, allowRoles("warden"), approveRequest);
router.post("/:id/reject", protect, allowRoles("warden"), rejectRequest);
module.exports = router;
