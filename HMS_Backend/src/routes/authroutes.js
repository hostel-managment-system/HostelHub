const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { allowRoles } = require("../middlewares/roleMiddleware");


const { login, changePassword, createWardenByAdmin } = require("../controllers/authController");


router.post("/login", login);
router.post("/change-password", changePassword);
router.post("/create-warden", protect, allowRoles("admin"), createWardenByAdmin);
module.exports = router;
