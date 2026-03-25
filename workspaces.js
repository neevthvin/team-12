const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
    res.send("Workspaces homepage")
})

module.exports = router