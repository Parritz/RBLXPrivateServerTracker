const express = require("express");
const cors = require("cors");
const { createEnv } = require("./modules/env");
const { initializeBot } = require("./modules/trackerBot");

// Create .env file if it doesn't exist then load environment variables
createEnv();
require("dotenv").config();

// Initialize the tracker bot
initializeBot()

// Initialize the express server, set the port, and define the tracker account
const app = express();
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

app.listen(port, () => {
    console.log("Server is running on port " + port);
});