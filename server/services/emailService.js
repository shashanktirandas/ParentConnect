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
  return `
    <h2>⏰ Attendance Reminder</h2>

    <p>Hello <b>${student.name}</b>,</p>

    <p>
      You have not marked your attendance today.

      Please mark your attendance before <b>10:00 AM</b>.

      If attendance is not marked before 10:00 AM,
      your parent may receive an absence notification.
    </p>

    <hr>

    <p><b>ParentConnect</b></p>

    <p>AI Powered Automated Student Attendance Notification System</p>
  `;
}

function buildParentNotificationHtml(student) {
  return `
    <h2>🚨 Student Absence Alert</h2>

    <p>Dear <b>${student.parent_name}</b>,</p>

    <p>
      This is to inform you that your child

      <b>${student.name}</b>

      (Roll Number: <b>${student.roll_no}</b>)

      has not marked attendance today.

      Please contact your child if necessary.
    </p>

    <hr>

    <p>
      ParentConnect

      AI Powered Automated Student Attendance Notification System
    </p>
  `;
}

function buildFacultyAbsentReportHtml(absentStudents) {
  const current = formatDateTime();
  const tableRows = absentStudents
    .map(
      (student) => `
        <tr>
          <td>${student.roll_no}</td>
          <td>${student.name}</td>
          <td>${student.department}</td>
          <td>${student.year}</td>
          <td>${student.section}</td>
        </tr>
      `
    )
    .join("");

  return `
    <h2>Today's Absent Student Report</h2>

    <p><b>Date:</b> ${current.date}</p>

    <p><b>Total Absent Students:</b> ${absentStudents.length}</p>

    <table border="1" cellpadding="8" cellspacing="0">
      <thead>
        <tr>
          <th>Roll Number</th>
          <th>Student Name</th>
          <th>Department</th>
          <th>Year</th>
          <th>Section</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows || "<tr><td colspan=\"5\">No absent students today.</td></tr>"}
      </tbody>
    </table>

    <br>

    <hr>

    <p>Generated automatically by ParentConnect</p>
    <p>AI Powered Automated Student Attendance Notification System</p>
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

  console.log(`Reminder email sent to ${student.student_email}`);
}

async function sendParentNotification(student) {
  if (!student.parent_email) {
    console.log(`Parent notification skipped: no parent email found for ${student.roll_no}.`);
    return;
  }

  await transporter.sendMail({
    from: `ParentConnect <${process.env.FROM_EMAIL}>`,
    to: student.parent_email,
    subject: "Student Absence Notification - ParentConnect",
    html: buildParentNotificationHtml(student),
  });

  console.log(`Parent email sent to ${student.parent_email}`);
}

async function sendFacultyAbsentReport(absentStudents) {
  if (!process.env.FACULTY_EMAIL) {
    throw new Error("FACULTY_EMAIL is not configured.");
  }

  await transporter.sendMail({
    from: `ParentConnect <${process.env.FROM_EMAIL}>`,
    to: process.env.FACULTY_EMAIL,
    subject: "Today's Absent Student Report - ParentConnect",
    html: buildFacultyAbsentReportHtml(absentStudents),
  });

  console.log("Faculty report sent successfully.");
}

module.exports = {
  sendAttendanceConfirmation,
  sendReminderEmail,
  sendParentNotification,
  sendFacultyAbsentReport,
  // Future reusable email functions can be added here:
};
