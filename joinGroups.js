const express = require("express")
const router = express.Router()
const pool = require("./config/db")
const { mustBeLoggedIn } = require("./middleware/auth")

const JOIN_MESSAGES = {
  requested: "Join request sent to the group owner.",
  joined: "You joined the group.",
  approved: "Request approved.",
  denied: "Request denied.",
  already: "You already joined or requested this group.",
  error: "Something went wrong."
}

function backToJoin(res, workspaceID, code) {
  return res.redirect(`/workspaces/${workspaceID}/join-groups?m=${code}`)
}

router.get("/:workspaceID/join-groups", mustBeLoggedIn, async (req, res) => {
  const workspaceID = Number(req.params.workspaceID)
  const userID = req.user.userID
  try {
    const [membership] = await pool.query(
      "SELECT 1 FROM User_Workspace WHERE workspaceID = ? AND userID = ?", [workspaceID, userID])
    if (!membership.length) return res.status(403).redirect("/workspaces")

    const [workspaceRows] = await pool.query(
      "SELECT workspaceID, workspaceName, userID FROM Workspace WHERE workspaceID = ?", [workspaceID])

    const [invites] = await pool.query(
      `SELECT r.requestID AS id, t.groupName,
              COALESCE(NULLIF(TRIM(p.displayName), ''), u.username) AS requester
       FROM Team_Request r
       JOIN Team t ON t.groupID = r.groupID
       JOIN User u ON u.userID = r.userID
       LEFT JOIN User_Profile p ON p.userID = u.userID
       WHERE t.userID = ? AND t.workspaceID = ?
       ORDER BY r.createdAt`,
      [userID, workspaceID])

    const [publicGroups] = await pool.query(
      `SELECT t.groupID AS id, t.groupName AS name, t.ownerName AS owner, t.joinType,
              EXISTS(SELECT 1 FROM Team_Request r
                     WHERE r.groupID = t.groupID AND r.userID = ?) AS requested
       FROM Team t
       WHERE t.workspaceID = ? AND t.visibility = 'public'
         AND NOT EXISTS (SELECT 1 FROM User_Team ut
                         WHERE ut.groupID = t.groupID AND ut.userID = ?)
       ORDER BY t.groupName`,
      [userID, workspaceID, userID])

    res.render("JoinGroup", {
      isWorkspaceOwner: Number(workspaceRows[0].userID) === Number(userID),
      workspace: workspaceRows[0],
      invites,
      publicGroups,
      message: JOIN_MESSAGES[req.query.m] || ""
    })
  } catch (err) {
    console.error(err)
    res.status(500).send("Database error")
  }
})

router.post("/:workspaceID/join-groups/:groupID", mustBeLoggedIn, async (req, res) => {
  const workspaceID = Number(req.params.workspaceID)
  const groupID = Number(req.params.groupID)
  const userID = req.user.userID
  try {
    const [membership] = await pool.query(
      "SELECT 1 FROM User_Workspace WHERE workspaceID = ? AND userID = ?", [workspaceID, userID])
    if (!membership.length) return res.status(403).redirect("/workspaces")

    const [groups] = await pool.query(
      "SELECT groupID, joinType FROM Team WHERE groupID = ? AND workspaceID = ? AND visibility = 'public'",
      [groupID, workspaceID])
    if (!groups.length) return backToJoin(res, workspaceID, "error")

    const [already] = await pool.query(
      "SELECT 1 FROM User_Team WHERE groupID = ? AND userID = ?", [groupID, userID])
    if (already.length) return backToJoin(res, workspaceID, "already")

    if (groups[0].joinType === "open") {
      await pool.query(
        "INSERT INTO User_Team (userID, workspaceID, groupID, isOwner) VALUES (?, ?, ?, 0)",
        [userID, workspaceID, groupID])
      return backToJoin(res, workspaceID, "joined")
    }

    await pool.query(
      "INSERT IGNORE INTO Team_Request (groupID, workspaceID, userID) VALUES (?, ?, ?)",
      [groupID, workspaceID, userID])
    return backToJoin(res, workspaceID, "requested")
  } catch (err) {
    console.error(err)
    return backToJoin(res, workspaceID, "error")
  }
})

router.post("/:workspaceID/join-groups/requests/:requestID/approve", mustBeLoggedIn, async (req, res) => {
  const workspaceID = Number(req.params.workspaceID)
  const requestID = Number(req.params.requestID)
  let connection
  try {
    connection = await pool.getConnection()
    await connection.beginTransaction()

    const [rows] = await connection.query(
      `SELECT r.userID, r.groupID FROM Team_Request r
       JOIN Team t ON t.groupID = r.groupID
       WHERE r.requestID = ? AND t.userID = ? AND t.workspaceID = ?
       FOR UPDATE`,
      [requestID, req.user.userID, workspaceID])
    if (!rows.length) {
      await connection.rollback()
      return backToJoin(res, workspaceID, "error")
    }

    await connection.query(
      `INSERT INTO User_Team (userID, workspaceID, groupID, isOwner)
       SELECT ?, ?, ?, 0 FROM DUAL
       WHERE NOT EXISTS (SELECT 1 FROM User_Team WHERE userID = ? AND groupID = ?)`,
      [rows[0].userID, workspaceID, rows[0].groupID, rows[0].userID, rows[0].groupID])
    await connection.query("DELETE FROM Team_Request WHERE requestID = ?", [requestID])

    await connection.commit()
    return backToJoin(res, workspaceID, "approved")
  } catch (err) {
    if (connection) await connection.rollback()
    console.error(err)
    return backToJoin(res, workspaceID, "error")
  } finally {
    if (connection) connection.release()
  }
})

router.post("/:workspaceID/join-groups/requests/:requestID/deny", mustBeLoggedIn, async (req, res) => {
  const workspaceID = Number(req.params.workspaceID)
  try {
    await pool.query(
      `DELETE r FROM Team_Request r
       JOIN Team t ON t.groupID = r.groupID
       WHERE r.requestID = ? AND t.userID = ? AND t.workspaceID = ?`,
      [Number(req.params.requestID), req.user.userID, workspaceID])
    return backToJoin(res, workspaceID, "denied")
  } catch (err) {
    console.error(err)
    return backToJoin(res, workspaceID, "error")
  }
})

module.exports = router