const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // check account active
    if (!user.isActive) {
      return res.status(403).json({ message: "Account disabled" });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // success (no force change for now)
    // create token
const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

res.status(200).json({
  message: "Login successful",
  token,
  role: user.role,
  mustChangePassword: user.mustChangePassword,
});

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.mustChangePassword = false;

    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ADMIN creates admin / warden
exports.createWardenByAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    // allow only admin or warden creation
    if (!["admin", "warden"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // duplicate check
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name, // ✅ FIXED
      email,
      password: hashedPassword,
      role,
      isActive: true,
      mustChangePassword: true,
    });

    res.status(201).json({
      message: `${role} created successfully`,
      userId: user._id,
    });
  } catch (error) {
    console.error("CREATE WARDEN ERROR:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
