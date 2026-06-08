const pool = require("../config/db");

async function getDashboard(req, res) {

    const { faculty_id } = req.query;

    if (!faculty_id) {
        return res.json({
            success: false,
            message: "Faculty ID required"
        });
    }

    try {

        // Get faculty details
        const [facultyRows] = await pool.execute(
            `SELECT department, year, section
             FROM faculty
             WHERE faculty_id=?`,
            [faculty_id]
        );

        if (facultyRows.length === 0) {
            return res.json({
                success: false,
                message: "Faculty not found"
            });
        }

        const faculty = facultyRows[0];

        // Total Students
        const [total] = await pool.execute(
            `SELECT COUNT(*) total
             FROM students
             WHERE department=?
             AND year=?
             AND section=?`,
            [
                faculty.department,
                faculty.year,
                faculty.section
            ]
        );

        // Present Students
        const [present] = await pool.execute(
            `SELECT COUNT(*) total
             FROM students s
             JOIN attendance a
             ON s.id=a.student_id
             WHERE s.department=?
             AND s.year=?
             AND s.section=?
             AND a.attendance_date=CURDATE()`,
            [
                faculty.department,
                faculty.year,
                faculty.section
            ]
        );

        // Absent Students
        const [absent] = await pool.execute(
            `SELECT COUNT(*) total
             FROM students
             WHERE department=?
             AND year=?
             AND section=?
             AND id NOT IN
             (
                 SELECT student_id
                 FROM attendance
                 WHERE attendance_date=CURDATE()
             )`,
            [
                faculty.department,
                faculty.year,
                faculty.section
            ]
        );

        // Parent Alerts
       const [alerts] = await pool.execute(
    `SELECT COUNT(DISTINCT nl.student_id) total

     FROM notification_logs nl

     JOIN students s

     ON nl.student_id=s.id

     WHERE nl.email_type='Parent'

     AND DATE(nl.sent_at)=CURDATE()

     AND s.department=?

     AND s.year=?

     AND s.section=?`,
    [
        faculty.department,
        faculty.year,
        faculty.section
    ]
        );
        const [students] = await pool.execute(

        `SELECT

        s.roll_no,

        s.name,

        CASE

        WHEN a.student_id IS NULL

        THEN 'Absent'

        ELSE 'Present'

        END AS status,

        a.attendance_time

        FROM students s

        LEFT JOIN attendance a

        ON s.id = a.student_id

        AND a.attendance_date = CURDATE()

        WHERE

        s.department=?

        AND s.year=?

        AND s.section=?`,

        [
            faculty.department,
            faculty.year,
            faculty.section
        ]

        );
        res.json({

            success: true,

            data:{

                totalStudents:total[0].total,

                presentStudents:present[0].total,

                absentStudents:absent[0].total,

                alertsSent:alerts[0].total,

                students:students

            }

        });

    }

    catch (err) {

        console.log(err);

        res.status(500).json({

            success: false,

            message: "Server Error"

        });

    }

}

module.exports = {

    getDashboard

};