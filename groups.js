const express = require("express")
const router = express.Router()

router.get("/", (req, res) => {
    res.send("Groups homepage")
})

module.exports = router