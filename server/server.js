require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const attendanceRoutes = require("./routes/attendanceRoutes");
const { reminderScheduler } = require("./scheduler/reminderScheduler");
const { parentNotificationScheduler } = require("./scheduler/parentNotificationScheduler");

const app = express();
const PORT = 3000;

// Parse JSON request bodies for API routes.
app.use(cors());
app.use(express.json());

// Register feature routes in a modular way for future expansion.
app.use("/api/attendance", attendanceRoutes);

// Lightweight health endpoint for checking that the server is alive.
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ParentConnect backend is running.",
  });
});

async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to ParentConnect Database");
    connection.release();
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error);
  }
}

async function startServer() {
  await testDatabaseConnection();
  reminderScheduler();
  parentNotificationScheduler();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
