const express = require("express");
const noblox = require("noblox.js");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { createEnv } = require("./modules/env");
const { getTokens, getUserData } = require("./modules/discordOAuth");

const app = express();
const port = process.env.PORT || 3000;

// Create .env file if it doesn"t exist then load environment variables
createEnv()
require("dotenv").config()

// Set up middleware
app.set("view engine", "ejs")
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods from the client
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
}));

function redirectFrontend(res, path) {
    console.log(`${process.env.CLIENT_URL}${path}`)
    res.redirect(`${process.env.CLIENT_URL}${path}`);
}

function isAuthenticated(req, res, next) {
    const token = req.body.authentication;
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

app.get("/oauth", (req, res) => {
    res.redirect("https://discord.com/oauth2/authorize?client_id=1391882795353112628&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth%2Flogin&scope=identify")
});

app.get("/oauth/login", async (req, res) => {
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
            // return res.status(400).send("Invalid OAuth2 code"); - idk if the frontend should be doing more of the heavy lifting here
        }

        const userData = await getUserData(tokens.access_token);
        if (!userData.id) {
            console.error("Failed to retrieve user data");
            redirectFrontend(res, "/");
            return;
            // return res.status(400).send("Invalid user data");
        }

        userData.refresh_token = tokens.refresh_token; // Add their Discord refresh token to their user data (if they leak it, their fault)
        console.log(userData);
        const token = jwt.sign(userData, process.env.SECRET, { expiresIn: "7d" });
        redirectFrontend(res, "/login?token=" + token);
    } catch (err) {
        console.error("Error during OAuth2 process:", err);
        redirectFrontend(res, "/");
    }
});

// Used for verifying the JWT token in the cookies
app.post('/api/verify', (req, res) => {
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

app.post('/api/game', isAuthenticated, (req, res) => {
    const { id } = req.body;
    if (!id) {
        return res.status(400).json({ error: "Game ID is required" });
    }

    console.log(req.cookies);
    res.status(200).json({ message: "Game added successfully" });
});

app.post('/api/cookie', isAuthenticated, (req, res) => {
    const { cookie } = req.body;
    if (!cookie) {
        return res.status(400).json({ error: "Game ID is required" });
    }

    console.log(req.cookies);
    res.status(200).json({ message: "Game added successfully" });
})

app.listen(port, () => {
    console.log("Server is running on port " + port);
});