const express = require("express")
const router = express.Router()
const pool = require("./config/db")
const { mustBeLoggedIn } = require("./middleware/auth")

const STATUSES = ["To Do", "In Progress", "Done"]

// returns the group and whether this user is the leader, or null if not a member
async function getAccess(groupID, userID) {
    const [rows] = await pool.query(
        `SELECT g.* FROM \`Team\` g
         JOIN User_Team ut ON ut.groupID = g.groupID AND ut.userID = ?
         WHERE g.groupID = ?`,
        [userID, groupID]
    )
    if (!rows.length) return null
    return { group: rows[0], isLeader: Number(rows[0].userID) === Number(userID) }
}

// validates title, description and due date from a request body
function cleanTask(body) {
    const title = typeof body.title === "string" ? body.title.trim() : ""
    const description = typeof body.description === "string" ? body.description.trim() : ""
    let dueDate = typeof body.dueDate === "string" ? body.dueDate.trim() : ""

    if (!title) return { error: "Title is required." }
    if (title.length > 100) return { error: "Title cannot exceed 100 characters." }
    if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return { error: "Invalid due date." }

    return { title, description: description || null, dueDate: dueDate || null }
}

// Planning page
router.get("/:groupID/planning", mustBeLoggedIn, async (req, res) => {
    try {
        const access = await getAccess(req.params.groupID, req.user.userID)
        if (!access) return res.status(403).redirect("/workspaces")

        const [workspaceRows] = await pool.query(
            "SELECT workspaceID, workspaceName FROM Workspace WHERE workspaceID = ?",
            [access.group.workspaceID]
        )
        const [tasks] = await pool.query(
            `SELECT taskID, title, description, status, dueDate, sortOrder
             FROM Tasks WHERE groupID = ?
             ORDER BY sortOrder, taskID`,
            [access.group.groupID]
        )

        return res.render("Planning", {
            group: access.group,
            workspace: workspaceRows[0],
            tasks,
            statuses: STATUSES,
            isGroupOwner: access.isLeader
        })
    } catch (err) {
        console.error(err)
        return res.status(500).send("Database error")
    }
})

// Create a card (leader only)
router.post("/:groupID/planning/tasks", mustBeLoggedIn, async (req, res) => {
    try {
        const access = await getAccess(req.params.groupID, req.user.userID)
        if (!access) return res.status(403).json({ success: false, message: "Not a group member" })
        if (!access.isLeader) return res.status(403).json({ success: false, message: "Only the group leader can add cards" })

        const task = cleanTask(req.body)
        if (task.error) return res.status(400).json({ success: false, message: task.error })

        const [orderRows] = await pool.query(
            "SELECT COALESCE(MAX(sortOrder), 0) + 1 AS nextOrder FROM Tasks WHERE groupID = ? AND status = 'To Do'",
            [access.group.groupID]
        )
        const [result] = await pool.query(
            `INSERT INTO Tasks (title, description, status, groupID, createdBy, dueDate, sortOrder)
             VALUES (?, ?, 'To Do', ?, ?, ?, ?)`,
            [task.title, task.description, access.group.groupID, req.user.userID, task.dueDate, orderRows[0].nextOrder]
        )
        return res.json({ success: true, taskID: result.insertId })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Database error" })
    }
})

// Edit a card (any member)
router.post("/:groupID/planning/tasks/:taskID/edit", mustBeLoggedIn, async (req, res) => {
    try {
        const access = await getAccess(req.params.groupID, req.user.userID)
        if (!access) return res.status(403).json({ success: false, message: "Not a group member" })

        const task = cleanTask(req.body)
        if (task.error) return res.status(400).json({ success: false, message: task.error })

        const [result] = await pool.query(
            "UPDATE Tasks SET title = ?, description = ?, dueDate = ? WHERE taskID = ? AND groupID = ?",
            [task.title, task.description, task.dueDate, req.params.taskID, access.group.groupID]
        )
        if (!result.affectedRows) return res.status(404).json({ success: false, message: "Card not found" })
        return res.json({ success: true })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Database error" })
    }
})

// Move a card to a column and position (any member). Used by both the move button and drag and drop.
router.post("/:groupID/planning/tasks/:taskID/move", mustBeLoggedIn, async (req, res) => {
    const status = req.body.status
    if (!STATUSES.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" })

    let connection
    try {
        const access = await getAccess(req.params.groupID, req.user.userID)
        if (!access) return res.status(403).json({ success: false, message: "Not a group member" })

        connection = await pool.getConnection()
        await connection.beginTransaction()

        const [found] = await connection.query(
            "SELECT taskID FROM Tasks WHERE taskID = ? AND groupID = ?",
            [req.params.taskID, access.group.groupID]
        )
        if (!found.length) {
            await connection.rollback()
            return res.status(404).json({ success: false, message: "Card not found" })
        }

        // cards already in the target column, without the one being moved
        const [column] = await connection.query(
            `SELECT taskID FROM Tasks
             WHERE groupID = ? AND status = ? AND taskID <> ?
             ORDER BY sortOrder, taskID`,
            [access.group.groupID, status, req.params.taskID]
        )
        const ids = column.map(row => row.taskID)

        // position defaults to the end of the column
        let position = Number(req.body.position)
        if (!Number.isInteger(position) || position < 0 || position > ids.length) position = ids.length
        ids.splice(position, 0, Number(req.params.taskID))

        await connection.query("UPDATE Tasks SET status = ? WHERE taskID = ?", [status, req.params.taskID])
        for (let i = 0; i < ids.length; i++) {
            await connection.query("UPDATE Tasks SET sortOrder = ? WHERE taskID = ?", [i, ids[i]])
        }

        await connection.commit()
        return res.json({ success: true })
    } catch (err) {
        if (connection) await connection.rollback()
        console.error(err)
        return res.status(500).json({ success: false, message: "Database error" })
    } finally {
        if (connection) connection.release()
    }
})

// Delete a card (leader only)
router.post("/:groupID/planning/tasks/:taskID/delete", mustBeLoggedIn, async (req, res) => {
    try {
        const access = await getAccess(req.params.groupID, req.user.userID)
        if (!access) return res.status(403).json({ success: false, message: "Not a group member" })
        if (!access.isLeader) return res.status(403).json({ success: false, message: "Only the group leader can delete cards" })

        const [result] = await pool.query(
            "DELETE FROM Tasks WHERE taskID = ? AND groupID = ?",
            [req.params.taskID, access.group.groupID]
        )
        if (!result.affectedRows) return res.status(404).json({ success: false, message: "Card not found" })
        return res.json({ success: true })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ success: false, message: "Database error" })
    }
})

module.exports = router