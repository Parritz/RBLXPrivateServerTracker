const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { createEnv } = require("./modules/env");
const { initializeBot } = require("./modules/trackerBot");
const {getVIPServers} = require("./modules/vipServers");
const {dbGet} = require("./modules/database");

// Create .env file if it doesn't exist then load environment variables
createEnv();
require("dotenv").config();

// Initialize the tracker bot
initializeBot()

// Initialize the express server, set the port, and define the tracker account
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

const port = process.env.PORT || 3000;

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

// Setup routes
app.use(require("./routes/oauth"));
app.use(require("./routes/account"));
app.use(require("./routes/game"));

async function sendVIPServers(userId, socket) {
    const user = await dbGet("SELECT * FROM users WHERE discord_id = ?", [userId]);
    const accounts = JSON.parse(user.accounts);
    const games = JSON.parse(user.games);
    const allVIPServers = {};
    for (const game of Object.values(games)) {
        const vipServers = await getVIPServers(game.id);
        allVIPServers[game.id] = vipServers.data;
    }

    // Filter VIP servers to only include those owned by the user
    const filteredVIPServers = {};
    for (const [gameId, vipServers] of Object.entries(allVIPServers)) {
        const filtered = Object.values(vipServers).filter(server => {
            return server.owner && Object.keys(accounts).includes(server.owner.id.toString());
        });

        if (filtered.length > 0) {
            filteredVIPServers[gameId] = filtered;
        }
    }

    socket.emit('vipServers', filteredVIPServers);
}

// WebSocket connection handling
io.on('connection', (socket) => {
    socket.on('authenticate', async (token) => {
        try {
            // Verify the token and get user data
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.SECRET);

            if (decoded) {
                socket.userId = decoded.id;
                socket.join(`user_${decoded.id}`);
                
                // Send initial VIP server data
                await sendVIPServers(decoded.id, socket);
            }
        } catch (err) {
            console.error('Authentication failed:', err);
            socket.emit('auth_error', 'Invalid token');
        }
    });

    socket.on("requestVIPServers", async () => {
        try {
            await sendVIPServers(socket.userId, socket);
        } catch (err) {
            console.error('Error fetching VIP servers:', err);
            socket.emit('error', 'Failed to fetch VIP servers');
        }
    });
});

server.listen(port, () => {
    console.log("Server is running on port " + port);
});