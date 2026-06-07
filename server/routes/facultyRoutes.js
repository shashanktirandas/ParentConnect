const express = require("express");
const { loginFaculty } = require("../controllers/facultyController");

const router = express.Router();

// POST /api/faculty/login
// Authenticates a faculty member without exposing the stored password.
router.post("/login", loginFaculty);

module.exports = router;
