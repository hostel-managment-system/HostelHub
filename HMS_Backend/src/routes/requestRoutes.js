const express = require("express");
const router = express.Router();

const {
  createRequest,
  approveRequest,
  rejectRequest,
  getRequests,
} = require("../controllers/requestController");
const { protect } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");

// public application
router.post("/", createRequest);

// authority (warden can see all pending)
router.get("/", protect, allowRoles("warden"), getRequests);
// authority
router.post("/:id/approve", protect, allowRoles("warden"), approveRequest);
router.post("/:id/reject", protect, allowRoles("warden"), rejectRequest);
module.exports = router;
