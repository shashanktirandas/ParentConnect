const cron = require("node-cron");
const pool = require("../config/db");
const { sendReminderEmail } = require("../services/emailService");

const REMINDER_EMAIL_TYPE = "Reminder";
const REMINDER_STATUS = {
  SUCCESS: "Success",
  FAILED: "Failed",
};

let reminderTask = null;
let isReminderJobRunning = false;

function getReminderSchedule() {
  return process.env.REMINDER_CRON || "45 9 * * *";
}

async function getStudentsWithoutAttendanceToday() {
  const [students] = await pool.execute(
    `SELECT
        id,
        name,
        roll_no,
        student_email
     FROM students
     WHERE id NOT IN (
        SELECT student_id
        FROM attendance
        WHERE attendance_date = CURDATE()
     )`
  );

  return students;
}

async function logReminderAttempt(studentId, status, message = null) {
  try {
    await pool.execute(
      `INSERT INTO notification_logs
        (student_id, email_type, status, message)
       VALUES
        (?, ?, ?, ?)`,
      [studentId, REMINDER_EMAIL_TYPE, status, message]
    );
  } catch (logError) {
    console.error("Failed to write reminder notification log:");
    console.error(logError);
  }
}

async function processReminderStudent(student) {
  if (!student.student_email) {
    console.log(`Reminder skipped: no email address for ${student.roll_no}.`);
    return;
  }

  try {
    await sendReminderEmail(student);
    await logReminderAttempt(student.id, REMINDER_STATUS.SUCCESS, "Reminder email sent successfully.");
  } catch (emailError) {
    console.error(`Reminder email failed for ${student.student_email}`);
    console.error(emailError);

    await logReminderAttempt(
      student.id,
      REMINDER_STATUS.FAILED,
      emailError.message || "Unknown email error"
    );
  }
}

async function runAttendanceReminderJob() {
  if (isReminderJobRunning) {
    console.log("Attendance reminder job skipped because a previous run is still active.");
    return;
  }

  isReminderJobRunning = true;

  try {
    console.log("Attendance reminder job started.");
    const students = await getStudentsWithoutAttendanceToday();

    for (const student of students) {
      await processReminderStudent(student);
    }

    console.log("Attendance reminder job completed.");
  } catch (error) {
    console.error("Attendance reminder job failed:");
    console.error(error);
  } finally {
    isReminderJobRunning = false;
  }
}

function startReminderScheduler() {
  if (reminderTask) {
    return reminderTask;
  }

  const schedule = getReminderSchedule();

  reminderTask = cron.schedule(
    schedule,
    runAttendanceReminderJob,
    {
      timezone: "Asia/Kolkata",
    }
  );

  console.log("Reminder scheduler started.");
  return reminderTask;
}

module.exports = {
  reminderScheduler: startReminderScheduler,
  startReminderScheduler,
  runAttendanceReminderJob,
};
