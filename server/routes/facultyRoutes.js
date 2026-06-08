const express = require("express");
const { loginFaculty,getNotifications } = require("../controllers/facultyController");

const router = express.Router();

// POST /api/faculty/login
// Authenticates a faculty member without exposing the stored password.
router.post("/login", loginFaculty);
router.get(
    "/notifications",
    getNotifications
);

module.exports = router;
