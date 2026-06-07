const mysql = require("mysql2/promise");

// Centralized MySQL pool for the application.
// Future models and controllers should import this pool instead of creating new connections.
const pool = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Mysql@15246",
  database: "parentconnect",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
