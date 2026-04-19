const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const pool = require("./config/db");
const { mustBeLoggedIn } = require("./middleware/auth");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/");
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

router.get("/", mustBeLoggedIn, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT * FROM User_Profile WHERE userID = ?`,
            [req.user.userID]
        );

        const profile = rows[0] || null;

        res.render("ProfileDetails", { profile, errors: [] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

router.post("/save-profile", mustBeLoggedIn, upload.single("profilePicture"), async (req, res) => {
    const { displayName, currentRole, organization, bio } = req.body;

    // this will exist ONLY if user uploaded a file
    const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const [rows] = await pool.query(
            "SELECT profileID FROM User_Profile WHERE userID = ?",
            [req.user.userID]
        );

        if (rows.length > 0) {
            if (profilePicture) {
                await pool.query(
                    `UPDATE User_Profile 
                     SET displayName=?, currentRole=?, organization=?, bio=?, profilePicture=?
                     WHERE userID=?`,
                    [displayName, currentRole, organization, bio, profilePicture, req.user.userID]
                );
            } else {
                await pool.query(
                    `UPDATE User_Profile 
                     SET displayName=?, currentRole=?, organization=?, bio=?
                     WHERE userID=?`,
                    [displayName, currentRole, organization, bio, req.user.userID]
                );
            }
        } else {
            await pool.query(
                `INSERT INTO User_Profile 
                 (userID, displayName, currentRole, organization, bio, profilePicture)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [req.user.userID, displayName, currentRole, organization, bio, profilePicture]
            );
        }

        res.redirect("/skills-selection");

    } catch (err) {
        console.error(err);
        res.render("ProfileDetails", {
            errors: ["Could not save profile"],
            profile: req.body
        });
    }
});

module.exports = router;