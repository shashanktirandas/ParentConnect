const cron = require("node-cron");
const pool = require("../config/db");
const { sendFacultyAbsentReport } = require("../services/emailService");

const FACULTY_EMAIL_TYPE = "Faculty";
const FACULTY_STATUS = {
  SUCCESS: "Success",
  FAILED: "Failed",
};
const SUCCESS_MESSAGE = "Faculty absent report sent.";

let facultyReportTask = null;
let isFacultyReportJobRunning = false;

function getFacultyReportSchedule() {
  return process.env.FACULTY_REPORT_CRON || "0 10 * * *";
}

async function getAbsentStudentsToday() {
  const [students] = await pool.execute(
    `SELECT
        roll_no,
        name,
        department,
        year,
        section
     FROM students
     WHERE id NOT IN (
        SELECT student_id
        FROM attendance
        WHERE attendance_date = CURDATE()
     )`
  );

  return students;
}

async function logFacultyReportAttempt(status, message) {
  try {
    await pool.execute(
      `INSERT INTO notification_logs
        (student_id, email_type, status, message)
       VALUES
        (?, ?, ?, ?)`,
      [null, FACULTY_EMAIL_TYPE, status, message]
    );
  } catch (logError) {
    console.error("Failed to write faculty report notification log:");
    console.error(logError);
  }
}

async function runFacultyReportJob() {
  if (isFacultyReportJobRunning) {
    console.log("Faculty report job skipped because a previous run is still active.");
    return;
  }

  isFacultyReportJobRunning = true;

  try {
    const absentStudents = await getAbsentStudentsToday();
    await sendFacultyAbsentReport(absentStudents);
    await logFacultyReportAttempt(FACULTY_STATUS.SUCCESS, SUCCESS_MESSAGE);
  } catch (error) {
    console.error("Faculty report failed.");
    console.error(error);

    await logFacultyReportAttempt(
      FACULTY_STATUS.FAILED,
      error.message || "Faculty report failed."
    );
  } finally {
    isFacultyReportJobRunning = false;
  }
}

function facultyReportScheduler() {
  if (facultyReportTask) {
    return facultyReportTask;
  }

  facultyReportTask = cron.schedule(
    getFacultyReportSchedule(),
    runFacultyReportJob,
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log("Faculty report scheduler started.");
  return facultyReportTask;
}

module.exports = {
  facultyReportScheduler,
  runFacultyReportJob,
};
