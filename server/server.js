const express = require("express");
const pool = require("./config/db");

const app = express();
const PORT = 3000;

// Built-in middleware for future JSON request bodies.
app.use(express.json());

// Health route only confirms that the server process is running.
// Attendance APIs, faculty login, and dashboards will be added in future phases.
app.get("/", (req, res) => {
  res.send("ParentConnect backend is running.");
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

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
