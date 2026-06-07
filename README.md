# ParentConnect

ParentConnect is an AI-Powered Automated Student Attendance Notification System for Pallavi Engineering College.

## Current Phase

This phase includes only the project structure and frontend UI. Backend logic, database connectivity, faculty authentication, email notifications, and scheduler jobs are intentionally not implemented yet.

## Technology Stack

- Frontend: HTML5, CSS3, Vanilla JavaScript
- Backend: Node.js + Express
- Database: MySQL
- Email Service: Nodemailer (future implementation)
- Scheduler: node-cron (future implementation)

## Project Structure

```text
ParentConnect/
├── client/
│   ├── index.html
│   ├── faculty-login.html
│   ├── dashboard.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   └── images/
├── server/
│   ├── server.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── scheduler/
│   ├── middleware/
│   └── config/
├── database/
│   └── schema.sql
├── assets/
├── package.json
└── README.md
```

## Run the Frontend

Open `client/index.html` in a browser to view the attendance page.

## Notes for Future Expansion

- Add Express API routes inside `server/routes`.
- Add database configuration inside `server/config`.
- Add MySQL models and queries inside `server/models`.
- Add email notification controllers using Nodemailer.
- Add scheduled attendance checks using node-cron.
