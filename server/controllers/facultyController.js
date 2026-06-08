const pool = require("../config/db");

async function loginFaculty(req, res) {
  const { faculty_id, password } = req.body;

  if (!faculty_id || !password) {
    return res.status(400).json({
      success: false,
      message: "Faculty ID and Password are required",
    });
  }

  try {
    // Parameterized query prevents SQL injection while looking up the faculty record.
    const [facultyRows] = await pool.execute(
      `SELECT
        id,
        faculty_id,
        name,
        password,
        email,
        department,
        year,
        section
       FROM faculty
       WHERE faculty_id = ?
       LIMIT 1`,
      [faculty_id]
    );

    if (facultyRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Invalid Faculty ID",
      });
    }

    const faculty = facultyRows[0];

    // Passwords are compared as stored for this phase; hashing can be introduced later.
    if (faculty.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      faculty: {
        id: faculty.id,
        faculty_id: faculty.faculty_id,
        name: faculty.name,
        department: faculty.department,
        year: faculty.year,
        section: faculty.section,
      },
    });
  } catch (error) {
    console.error("Faculty login failed:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
async function getNotifications(req, res) {

    const { faculty_id } = req.query;

    try {

        const [rows] = await pool.execute(

            `SELECT

            nl.sent_at,

            nl.email_type,

            s.roll_no,

            s.name,

            nl.status

            FROM notification_logs nl

            JOIN students s

            ON nl.student_id = s.id

            JOIN faculty f

            ON s.department = f.department
            AND s.year = f.year
            AND s.section = f.section

            WHERE f.faculty_id = ?

            ORDER BY nl.sent_at DESC

            LIMIT 50`,

            [faculty_id]

        );

        res.json({

            success: true,

            notifications: rows

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

}
module.exports = {
  loginFaculty,
    getNotifications
};
