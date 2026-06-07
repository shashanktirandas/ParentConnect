const cron = require("node-cron");
const pool = require("../config/db");
const { sendParentNotification } = require("../services/emailService");

const PARENT_EMAIL_TYPE = "Parent";
const PARENT_STATUS = {
  SUCCESS: "Success",
  FAILED: "Failed",
};

let parentNotificationTask = null;
let isParentNotificationJobRunning = false;

function getParentNotificationSchedule() {
  return process.env.PARENT_NOTIFICATION_CRON || "0 10 * * *";
}

async function getStudentsWithoutAttendanceToday() {
  const [students] = await pool.execute(
    `SELECT
        id,
        name,
        roll_no,
        parent_name,
        parent_email
     FROM students
     WHERE id NOT IN (
        SELECT student_id
        FROM attendance
        WHERE attendance_date = CURDATE()
     )`
  );

  return students;
}

async function logParentNotificationAttempt(studentId, status, message = null) {
  try {
    await pool.execute(
      `INSERT INTO notification_logs
        (student_id, email_type, status, message)
       VALUES
        (?, ?, ?, ?)`,
      [studentId, PARENT_EMAIL_TYPE, status, message]
    );
  } catch (logError) {
    console.error("Failed to write parent notification log:");
    console.error(logError);
  }
}

async function processParentNotificationStudent(student) {
  if (!student.parent_email) {
    console.log(`Parent notification skipped: no parent email for ${student.roll_no}.`);
    return;
  }

  try {
    await sendParentNotification(student);
    await logParentNotificationAttempt(
      student.id,
      PARENT_STATUS.SUCCESS,
      "Parent absence notification sent successfully."
    );
  } catch (emailError) {
    console.error(`Parent email failed for ${student.parent_email}`);
    console.error(emailError);

    await logParentNotificationAttempt(
      student.id,
      PARENT_STATUS.FAILED,
      emailError.message || "Unknown email error"
    );
  }
}

async function runParentNotificationJob() {
  if (isParentNotificationJobRunning) {
    console.log("Parent notification job skipped because a previous run is still active.");
    return;
  }

  isParentNotificationJobRunning = true;

  try {
    console.log("Parent notification job started.");
    const students = await getStudentsWithoutAttendanceToday();

    for (const student of students) {
      await processParentNotificationStudent(student);
    }

    console.log("Parent notification job completed.");
  } catch (error) {
    console.error("Parent notification job failed:");
    console.error(error);
  } finally {
    isParentNotificationJobRunning = false;
  }
}

function parentNotificationScheduler() {
  if (parentNotificationTask) {
    return parentNotificationTask;
  }

  parentNotificationTask = cron.schedule(
    getParentNotificationSchedule(),
    runParentNotificationJob,
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log("Parent notification scheduler started.");
  return parentNotificationTask;
}

module.exports = {
  parentNotificationScheduler,
  runParentNotificationJob,
};
