const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const db = require("./db");

const app = express();
const JWT_SECRET = "event_management_secret";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// =========================
// HOME
// =========================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});


// =========================
// REGISTER
// =========================

app.post("/api/register", async (req, res) => {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {

        const [existing] = await db.promise().query(
            "SELECT id FROM users WHERE username = ? OR email = ?",
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                message: "Username or email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.promise().query(
            `INSERT INTO users
            (username, email, password, role)
            VALUES (?, ?, ?, 'user')`,
            [username, email, hashedPassword]
        );

        res.status(201).json({
            message: "Registration successful"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// =========================
// LOGIN
// =========================

app.post("/api/login", async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    try {

        const [users] = await db.promise().query(
            `SELECT id, username, email, password, role
             FROM users
             WHERE username = ?`,
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const user = users[0];

        const match = await bcrypt.compare(
            password,
            user.password
        );

        if (!match) {
            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        console.log(
            "LOGIN:",
            user.username,
            user.role
        );

        res.json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        console.error("LOGIN ERROR:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// =========================
// AUTHENTICATION
// =========================

function authenticateToken(req, res, next) {

    const header = req.headers.authorization;

    if (!header) {
        return res.status(401).json({
            message: "Please login first"
        });
    }

    const token = header.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }

    try {

        req.user = jwt.verify(
            token,
            JWT_SECRET
        );

        next();

    } catch (error) {

        return res.status(403).json({
            message: "Invalid or expired token"
        });
    }
}


// =========================
// ADMIN CHECK
// =========================

function requireAdmin(req, res, next) {

    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            message: "Admin access required"
        });
    }

    next();
}


// =========================
// CREATE EVENT
// =========================

app.post(
    "/api/events",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        const {
            name,
            date,
            location,
            details
        } = req.body;

        if (!name || !date || !location) {
            return res.status(400).json({
                message:
                    "Event name, date and location are required"
            });
        }

        try {

            const [result] = await db.promise().query(
                `INSERT INTO events
                (name, date, location, details)
                VALUES (?, ?, ?, ?)`,
                [
                    name,
                    date,
                    location,
                    details || ""
                ]
            );

            console.log(
                "EVENT CREATED:",
                result.insertId
            );

            res.status(201).json({
                message: "Event created successfully",
                eventId: result.insertId
            });

        } catch (error) {

            console.error(
                "CREATE EVENT ERROR:",
                error
            );

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


// =========================
// GET EVENTS
// =========================

app.get(
    "/api/events",
    authenticateToken,
    async (req, res) => {

        try {

            const [events] = await db.promise().query(
                `SELECT
                    id,
                    name,
                    DATE_FORMAT(date, '%Y-%m-%d') AS date,
                    location,
                    details
                 FROM events
                 ORDER BY date ASC`
            );

            console.log(
                "EVENTS SENT:",
                events.length
            );

            res.json(events);

        } catch (error) {

            console.error(
                "GET EVENTS ERROR:",
                error
            );

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


// =========================
// BOOK EVENT
// =========================

app.post(
    "/api/events/:eventId/book",
    authenticateToken,
    async (req, res) => {

        const userId = req.user.id;
        const eventId = req.params.eventId;

        try {

            const [event] = await db.promise().query(
                "SELECT id FROM events WHERE id = ?",
                [eventId]
            );

            if (event.length === 0) {
                return res.status(404).json({
                    message: "Event not found"
                });
            }

            const [alreadyBooked] =
                await db.promise().query(
                    `SELECT id
                     FROM registrations
                     WHERE user_id = ?
                     AND event_id = ?`,
                    [userId, eventId]
                );

            if (alreadyBooked.length > 0) {
                return res.status(400).json({
                    message:
                        "You have already booked this event"
                });
            }

            await db.promise().query(
                `INSERT INTO registrations
                (user_id, event_id)
                VALUES (?, ?)`,
                [userId, eventId]
            );

            res.status(201).json({
                message: "Event booked successfully"
            });

        } catch (error) {

            console.error(
                "BOOKING ERROR:",
                error
            );

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


// =========================
// ADMIN VIEW REGISTERED USERS
// =========================

app.get(
    "/api/events/:eventId/users",
    authenticateToken,
    requireAdmin,
    async (req, res) => {

        const eventId = req.params.eventId;

        try {

            const [users] = await db.promise().query(
                `SELECT
                    users.id,
                    users.username,
                    users.email
                 FROM registrations
                 JOIN users
                    ON registrations.user_id = users.id
                 WHERE registrations.event_id = ?
                 ORDER BY users.username`,
                [eventId]
            );

            res.json(users);

        } catch (error) {

            console.error(
                "GET USERS ERROR:",
                error
            );

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);


// =========================
// START SERVER
// =========================

const PORT = 3000;

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});