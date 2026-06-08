const express = require("express");

const router = express.Router();

const {

    getDashboard,
    getNotifications

} = require("../controllers/dashboardController");

router.get("/", getDashboard);


module.exports = router;