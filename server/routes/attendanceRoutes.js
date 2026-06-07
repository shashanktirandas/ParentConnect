const express = require("express");
const { markAttendance } = require("../controllers/attendanceController");

const router = express.Router();

// POST /api/attendance/mark
// Marks one student's attendance for the current date.
router.post("/mark", markAttendance);

module.exports = router;
