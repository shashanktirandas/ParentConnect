const pool = require("../config/db");
const { sendAttendanceConfirmation } = require("../services/emailService");

const REQUIRED_FIELDS_MESSAGE = "Roll Number and Password are required.";

async function markAttendance(req, res) {
  const { roll_no, password } = req.body;

  // Validate request
  if (!roll_no || !password) {
    return res.status(400).json({
      success: false,
      message: REQUIRED_FIELDS_MESSAGE,
    });
  }

  try {
    // Find student
    const [students] = await pool.execute(
      "SELECT id, name, roll_no, student_email, password FROM students WHERE roll_no = ? LIMIT 1",
      [roll_no]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invalid Roll Number.",
      });
    }

    const student = students[0];

    // Verify password
    if (student.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Password.",
      });
    }

    // Check today's attendance
    const [existingAttendance] = await pool.execute(
      "SELECT id FROM attendance WHERE student_id = ? AND attendance_date = CURDATE() LIMIT 1",
      [student.id]
    );

    if (existingAttendance.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Attendance already marked today.",
      });
    }

    // Insert attendance
    await pool.execute(
      `INSERT INTO attendance
      (student_id, attendance_date, attendance_time, status)
      VALUES
      (?, CURDATE(), CURTIME(), ?)`,
      [student.id, "Present"]
    );

    // Email delivery should never block or reverse a successful attendance mark.
    try {
      await sendAttendanceConfirmation(student);
    } catch (emailError) {
      console.error("Attendance confirmation email failed:");
      console.error(emailError);
    }

    return res.status(200).json({
      success: true,
      message: "Attendance marked successfully.",
    });
  } catch (error) {
    console.error("Attendance marking failed:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
}

module.exports = {
  markAttendance,
};
