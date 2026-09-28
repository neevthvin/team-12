const express = require("express")
const router = express.Router()
const pool = require("./config/db")
const { mustBeLoggedIn } = require("./middleware/auth")

function renderCreateGroup(res, workspaceID, errors = [], formData = {}) {
    return res.status(errors.length ? 400 : 200).render("CreateGroups", {
        workspaceID,
        errors,
        formData
    });
}

router.get("/create", mustBeLoggedIn, async (req, res) => {
    const workspaceID = Number(req.query.workspaceID)
    if (!Number.isInteger(workspaceID) || workspaceID < 1) {
        return res.status(400).send("Missing or invalid workspaceID")
    }

    try {
        const [membership] = await pool.query(
            "SELECT workspaceID FROM User_Workspace WHERE workspaceID = ? AND userID = ?",
            [workspaceID, req.user.userID]
        )
        if (membership.length === 0) return res.status(403).redirect("/workspaces")

        return renderCreateGroup(res, workspaceID, [], {})
    } catch (err) {
        console.error(err)
        return res.status(500).send("Database error")
    }
})

router.post("/create", mustBeLoggedIn, async (req, res) => {
    const workspaceID = Number(req.body.workspaceID)
    const groupName = typeof req.body.groupName === "string" ? req.body.groupName.trim() : ""
    const description = typeof req.body.description === "string" ? req.body.description.trim() : ""
    const visibility = req.body.visibility
    const joinType = req.body.joinType
    const formData = { groupName, description, visibility, joinType }
    const errors = []

    if (!Number.isInteger(workspaceID) || workspaceID < 1) {
        return res.status(400).send("Missing or invalid workspaceID")
    }
    if (!groupName) errors.push("Group name is required.")
    if (groupName.length > 100) errors.push("Group name cannot exceed 100 characters.")
    if (visibility !== "private" && visibility !== "public") errors.push("Select a valid visibility.")
    if (joinType !== "request" && joinType !== "open") errors.push("Select a valid join type.")

    if (errors.length) return renderCreateGroup(res, workspaceID, errors, formData)

    let connection
    try {
        connection = await pool.getConnection()
        await connection.beginTransaction()

        const [membership] = await connection.query(
            "SELECT workspaceID FROM User_Workspace WHERE workspaceID = ? AND userID = ?",
            [workspaceID, req.user.userID]
        )
        if (membership.length === 0) {
            await connection.rollback()
            return res.status(403).redirect("/workspaces")
        }

        const [profile] = await connection.query(
            "SELECT displayName FROM User_Profile WHERE userID = ?",
            [req.user.userID]
        )
        const ownerName = profile[0]?.displayName?.trim() || req.user.username

        const [group] = await connection.query(
            `INSERT INTO \`Team\` (groupName, description, ownerName, userID, workspaceID, visibility, joinType)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [groupName, description || null, ownerName, req.user.userID, workspaceID, visibility, joinType]
        )

        await connection.query(
            "INSERT INTO User_Team (userID, workspaceID, groupID, isOwner) VALUES (?, ?, ?, 1)",
            [req.user.userID, workspaceID, group.insertId]
        )

        await connection.commit()
        return res.redirect(`/workspaces/${workspaceID}`)
    } catch (err) {
        if (connection) await connection.rollback()
        console.error(err)
        return res.status(500).send("Database error")
    } finally {
        if (connection) connection.release()
    }
})

router.get("/", mustBeLoggedIn, (req, res) => {
    res.send("Groups homepage")
})

module.exports = router