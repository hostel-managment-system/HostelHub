const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getMyFeedback,
  getAllFeedback,
  closeFeedback,
} = require("../controllers/feedbackController");

const { protect } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");

// student
router.post("/", protect, allowRoles("student"), createFeedback);
router.get("/my", protect, allowRoles("student"), getMyFeedback);

// admin / warden
router.get("/", protect, allowRoles("admin", "warden"), getAllFeedback);
router.put("/:id/close", protect, allowRoles("admin", "warden"), closeFeedback);

module.exports = router;
