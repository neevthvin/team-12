const jwt = require("jsonwebtoken");

// middleware to attach user info to req.user if logged in, if not set to null
async function attachUser(req, res, next) {
    const token = req.cookies.GROUPIFY;
    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWTSECRET);
        req.user = {
            userID: decoded.userID,
            username: decoded.username
        };
    } catch (err) {
        req.user = null;
    }
    next();
}

// mustBeGuest middleware blocks logged in users from visiting authentication pages
function mustBeGuest(req, res, next) {
    if (req.user) return res.redirect("/dashboard");
    next();
}

// mustBeLoggedIn middleware blocks non-logged in users from visiting certain pages
function mustBeLoggedIn(req, res, next) {
    if (!req.user) {
        return res.redirect("/login");
    }
    next();
}

module.exports = {
    attachUser,
    mustBeGuest,
    mustBeLoggedIn
};