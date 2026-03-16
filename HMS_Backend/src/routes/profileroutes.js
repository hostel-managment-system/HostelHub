const express = require("express");
const router = express.Router();

const {
  getMyProfile,
  upsertProfile,
   getStudents
} = require("../controllers/profileController");
const { protect } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");

// logged in users only
router.get("/me", protect, getMyProfile);
router.post("/me", protect, upsertProfile);
router.get( "/students",protect,allowRoles("admin", "warden"),getStudents);


module.exports = router;

