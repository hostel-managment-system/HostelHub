const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authroutes");
const hostelRoutes = require("./src/routes/hostelroutes");
const roomRoutes = require("./src/routes/roomroutes");
const requestRoutes = require("./src/routes/requestRoutes");
const profileRoutes = require("./src/routes/profileroutes");
const attendanceRoutes = require("./src/routes/attendanceroutes");
const feedbackRoutes = require("./src/routes/feedbackroutes");


connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/feedback", feedbackRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
