require("dotenv").config();

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function formatDateTime(date = new Date()) {
  return {
    date: date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}

function buildAttendanceConfirmationHtml(student) {
  const current = formatDateTime();

  return `
    <h2>✅ Attendance Confirmed</h2>

    <p>Hello <b>${student.name}</b>,</p>

    <p>Your attendance has been successfully marked.</p>

    <table border="1" cellpadding="8">
      <tr>
        <td><b>Roll Number</b></td>
        <td>${student.roll_no}</td>
      </tr>
      <tr>
        <td><b>Date</b></td>
        <td>${current.date}</td>
      </tr>
      <tr>
        <td><b>Time</b></td>
        <td>${current.time}</td>
      </tr>
    </table>

    <br>

    <p>
      Thank you for using
      <b>ParentConnect</b>
    </p>

    <hr>

    <p>
      AI Powered Automated Student Attendance Notification System
    </p>
  `;
}

function buildAttendanceReminderHtml(student) {
  const current = formatDateTime();

  return `
    <h2>Attendance Reminder</h2>

    <p>Hello <b>${student.name}</b>,</p>

    <p>Your attendance has not been marked for today.</p>

    <table border="1" cellpadding="8">
      <tr>
        <td><b>Roll Number</b></td>
        <td>${student.roll_no}</td>
      </tr>
      <tr>
        <td><b>Date</b></td>
        <td>${current.date}</td>
      </tr>
      <tr>
        <td><b>Reminder Time</b></td>
        <td>${current.time}</td>
      </tr>
    </table>

    <br>

    <p>
      Please mark your attendance as soon as possible.
    </p>

    <p>
      Thank you for using
      <b>ParentConnect</b>
    </p>

    <hr>

    <p>
      AI Powered Automated Student Attendance Notification System
    </p>
  `;
}

async function sendAttendanceConfirmation(student) {
  if (!student.student_email) {
    console.log(`Email skipped: no student email found for ${student.roll_no}.`);
    return;
  }

  await transporter.sendMail({
    from: `ParentConnect <${process.env.FROM_EMAIL}>`,
    to: student.student_email,
    subject: "Attendance Confirmed - ParentConnect",
    html: buildAttendanceConfirmationHtml(student),
  });

  console.log(`Attendance confirmation email sent to ${student.student_email}.`);
}

async function sendReminderEmail(student) {
  if (!student.student_email) {
    console.log(`Reminder skipped: no student email found for ${student.roll_no}.`);
    return;
  }

  await transporter.sendMail({
    from: `ParentConnect <${process.env.FROM_EMAIL}>`,
    to: student.student_email,
    subject: "Attendance Reminder - ParentConnect",
    html: buildAttendanceReminderHtml(student),
  });

  console.log(`Attendance reminder email sent to ${student.student_email}.`);
}

module.exports = {
  sendAttendanceConfirmation,
  sendReminderEmail,
  // Future reusable email functions can be added here:
  // sendParentNotification,
  // sendFacultyAbsentList,
};
