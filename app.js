const express = require("express");
const noblox = require("noblox.js");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { createEnv } = require("./modules/env");
const { getTokens, getUserData } = require("./modules/discordOAuth");
const { dbGet, dbRun } = require("./modules/database");

// Create .env file if it doesn't exist then load environment variables
createEnv();
require("dotenv").config();

// Initialize the express server, set the port, and define the tracker account
const app = express();
const port = process.env.PORT || 3000;
noblox.setCookie(process.env.ROBLOX_TRACKER_COOKIE).then((accountInfo) => {
   if (!accountInfo.id) {
       console.error("Failed to set Roblox tracker cookie. Please check your .env file.");
       process.exit(1); // Exit the application if the cookie is invalid
   }

    // Automatically accept friend requests from users who send them
    // Eventually, this should check if the user is in the database, but this is not an issue for now
    const friendRequestEvent = noblox.onFriendRequest()
    friendRequestEvent.on("data", function(userId) {
        try {
            noblox.acceptFriendRequest(userId);
        } catch (err) {
            console.error("Error accepting friend request:", err);
        }
    });
});

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
    res.redirect(`${process.env.CLIENT_URL}${path}`);
}

function isAuthenticated(req, res, next) {
    const token = req.headers.authentication;
    console.log("token:", token)
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
            await dbRun("INSERT INTO users (discord_id, accounts, games, refresh_token) VALUES (?, ?, ?, ?)", [userData.id, "[]", "[]", tokens.refresh_token]);
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

app.get('/api/account', isAuthenticated, async (req, res) => {
   try {
        const discordId = req.user.id;
        const user = await dbGet("SELECT * FROM users WHERE discord_id = ?", [discordId]);

        res.status(200).json({
            accounts: user.accounts ? JSON.parse(user.accounts) : [],
            games: user.games ? JSON.parse(user.games) : []
        });
   } catch (err) {
        console.error("Error retrieving Roblox accounts", err);
        res.status(500).json({ error: "Internal server error" });
   }
});

app.post('/api/account', isAuthenticated, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Account name is required" });
        }

        // Search for the user by name
        const robloxAccount = (await noblox.searchUsers(name, 1, null))[0];
        console.log(robloxAccount)

        // If the account does not exist, return a 404 error
        // Otherwise, add the account to the database
        if (!robloxAccount) {
            res.status(404).json({ error: "Account does not exist" });
            return;
        }

        // Retrieve the user from the database using their Discord ID
        const user = await dbGet("SELECT * FROM users WHERE discord_id = ?", [req.user.id]);
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // If the user already has this account, return a 409 error
        const accountIds = JSON.parse(user.accounts);
        if (accountIds.includes(robloxAccount.id)) {
            res.status(409).json({ error: "Account already exists" });
            return;
        }

        // Add the account to the user's accounts in the database
        accountIds.push(robloxAccount.id);
        await dbRun("UPDATE users SET accounts = ? WHERE discord_id = ?", [JSON.stringify(accountIds), req.user.id]);
        res.status(200).json({ message: "Account added successfully" });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/api/game', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: "Game ID is required" });
        }

        // // Search for the user by name
        // const gameInfo = await game

        // Retrieve the user from the database using their Discord ID
        const user = await dbGet("SELECT * FROM users WHERE discord_id = ?", [req.user.id]);
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // If the user already has this account, return a 409 error
        // const gameIds = JSON.parse(user.games);
        // if (gameIds.includes(robloxAccount.id)) {
        //     res.status(409).json({ error: "Game is already tracked" });
        //     return;
        // }

        // Add the account to the user's accounts in the database
        // gameIds.push(robloxAccount.id);
        // await dbRun("UPDATE users SET accounts = ? WHERE discord_id = ?", [JSON.stringify(gameIds), req.user.id]);
        // res.status(200).json({ message: "Game added successfully" });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/api/cookie', isAuthenticated, (req, res) => {
    const { cookie } = req.body;
    if (!cookie) {
        return res.status(400).json({ error: "Game ID is required" });
    }

    res.status(200).json({ message: "Game added successfully" });
})

app.listen(port, () => {
    console.log("Server is running on port " + port);
});