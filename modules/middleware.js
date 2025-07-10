const jwt = require("jsonwebtoken");

// Redirects the frontend to a specified path
function redirectFrontend(res, path) {
    res.redirect(`${process.env.CLIENT_URL}${path}`);
}

// Checks if the user is authenticated by verifying the JWT token in the request headers
function isAuthenticated(req, res, next) {
    const token = req.headers.authentication;
    if (!token) {
        redirectFrontend(res, "/")
        return;
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            console.error("JWT verification failed:", err);
            redirectFrontend(res, "/");
            return;
        }

        req.user = decoded;
        next();
    });
}

module.exports = {
    redirectFrontend,
    isAuthenticated
}