const { dbGet, dbRun } = require("../modules/database");
const { Router } = require("express");
const { getTokens, getUserData } = require("../modules/discordOAuth");
const { redirectFrontend } = require("../modules/middleware");
const jwt = require("jsonwebtoken");

const router = Router();

router.get("/oauth", (req, res) => {
    res.redirect("https://discord.com/oauth2/authorize?client_id=1391882795353112628&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth%2Flogin&scope=identify")
});

router.get("/oauth/login", async (req, res) => {
    try {
        const code = req.query.code;
        if (!code) {
            redirectFrontend(res, "/");
            return;
        }

        const tokens = await getTokens(code);
        if (!tokens.access_token) {
            console.error("Failed to retrieve access token");
            redirectFrontend(res, "/");
            return;
        }

        const userData = await getUserData(tokens.access_token);
        if (!userData.id) {
            console.error("Failed to retrieve user data");
            redirectFrontend(res, "/");
            return;
        }

        // Add the user to the database if they don't exist
        const existingUser = await dbGet("SELECT * FROM users WHERE discord_id = ?", [userData.id]);
        if (!existingUser) {
            await dbRun("INSERT INTO users (discord_id, accounts, games, refresh_token) VALUES (?, ?, ?, ?)", [userData.id, "{}", "{}", tokens.refresh_token]);
            return;
        }

        // Sign their JWT token with their user data and send it to the frontend
        userData.refresh_token = tokens.refresh_token; // Add their Discord refresh token to their user data (if they leak it, their fault)
        const token = jwt.sign(userData, process.env.SECRET, { expiresIn: "7d" });
        redirectFrontend(res, "/login?token=" + token);
    } catch (err) {
        console.error("Error during OAuth2 process:", err);
        redirectFrontend(res, "/");
    }
});

// Used for verifying the JWT token in the cookies
router.post('/api/verify', (req, res) => {
    try {
        const token = req.body.token;
        jwt.verify(token, process.env.SECRET, (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ error: "Invalid token" });
            }
            res.status(200).json({ user: decodedToken });
        });
    } catch (err) {
        console.error("Error verifying token:", err);
        redirectFrontend(res, "/");
    }
});

module.exports = router;