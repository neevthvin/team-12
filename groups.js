const express = require("express")
const router = express.Router()

router.get("/create", (req, res) => {
    const workspaceID = req.query.workspaceID;
    if (!workspaceID) {
        return res.status(400).send("Missing workspaceID");
    }
    res.send(`Create Group form for Workspace ID: ${workspaceID}. (Placeholder - form coming soon)`)
})

router.get("/", (req, res) => {
    res.send("Groups homepage")
})

module.exports = router