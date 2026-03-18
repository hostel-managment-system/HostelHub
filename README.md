# 🏨 HostelHub - Advanced Hostel Management System

HostelHub is a premium, feature-rich management system designed to streamline hostel operations, enhance student-warden communication, and provide administrators with complete oversight of their facilities.

---

## ✨ Key Features

### 👑 Admin Dashboard
- **Hostel & Room Management**: Create, view, and manage hostels/rooms with nested control.
- **Annual Reset**: One-click functionality to clear allocations and reset the system for a new academic year.
- **Warden Oversight**: Create and manage warden accounts with secure credentials.
- **System Statistics**: Real-time overview of total hostels, active rooms, and occupancy status.

### 💂 Warden Dashboard
- **Allocation Requests**: Quickly approve or reject student room requests with automated bed count updates.
- **Smart Attendance**: Take daily session-wise attendance with automatic absentee tracking.
- **Room Coordination**: View occupancy layouts and student details by room.
- **Feedback Management**: Monitor and resolve student complaints and suggestions.

### 🎓 Student Dashboard
- **Live Room Status**: Real-time view of current allocation, room number, and roommates.
- **Request Portal**: Simple interface to request room allocation in available hostels.
- **Attendance History**: Track personal attendance records over the last 7 days.
- **Engagement**: Submit and track feedback or complaints directly to the warden.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS (Premium Glassmorphism Design)
- **Icons**: Lucide React
- **State Management**: React Context API
- **Networking**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT) & bcrypt.js
- **Validation**: Express-validator

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16.x or higher)
- MongoDB (Local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository** (if applicable)
   ```bash
   git clone [repository-url]
   cd HMS-Project
   ```

2. **Setup Backend**
   ```bash
   cd HMS_Backend
   npm install
   ```
   Create a `.env` file in the `HMS_Backend` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
   Start the server:
   ```bash
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd ../HMS_Frontend
   npm install
   ```
   Start the development server:
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```text
HostelHub/
├── HMS_Backend/         # Node.js & Express API
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── models/      # Mongoose schemas
│   │   ├── routes/      # API endpoints
│   │   └── middleware/  # Auth & Role guards
│   └── server.js        # Entry point
├── HMS_Frontend/        # React & Tailwind UI
│   ├── src/
│   │   ├── components/  # Reusable UI elements
│   │   ├── pages/       # Dashboard & Login views
│   │   ├── context/     # Auth state management
│   │   └── services/    # API communication
│   └── index.html       # Entry point
└── README.md            # Project documentation
```

---

## 🎨 Design Philosophy
HostelHub utilizes a **Modern Glassmorphism** aesthetic, featuring:
- Soft, vibrant gradients (`indigo` to `purple`).
- High-contrast, readable typography.
- Interactive `premium-card` components with subtle hover elevations.
- Responsive layouts for desktop and mobile access.

---

## 📄 License
This project is for educational and administrative management purposes. All rights reserved.
