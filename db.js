const mysql = require("mysql2");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "@rpitApandey1",
    database: "event_management",
    port: 3306
});

db.getConnection((err, connection) => {

    if (err) {
        console.error("Database connection failed:");
        console.error(err.message);
        return;
    }

    console.log("MySQL connected successfully!");

    connection.release();
});

module.exports = db;