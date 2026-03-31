const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const pool = require("./config/db");
const { mustBeLoggedIn } = require("./middleware/auth");

router.get("/", mustBeLoggedIn, async (req, res) => {
    try {
        const [skills] = await pool.query(
            `SELECT * 
             FROM Skills
             WHERE userID = ?`,
            [req.user.userID]
        );

        res.render("skills", { skills, errors: [] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

router.post("/", mustBeLoggedIn, async (req, res) => {
    const { skills } = req.body;

    if (!Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({ success: false, message: "No skills provided" });
    }

    try {
        // remove old skills first
        await pool.query(
            "DELETE FROM Skills WHERE userID = ?",
            [req.user.userID]
        );

        const values = skills.map(skill => [req.user.userID, skill]);

        const sql = "INSERT INTO Skills (userID, skills) VALUES ?";

        await pool.query(sql, [values]);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

module.exports = router;