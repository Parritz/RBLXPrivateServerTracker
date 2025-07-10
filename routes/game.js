const { dbGet, dbRun } = require("../modules/database");
const { Router } = require("express");
const { isAuthenticated } = require("../modules/middleware");
const noblox = require("noblox.js");

const router = Router();

router.post('/api/game', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ error: "Game ID is required" });
        }

        // Search for the game by ID
        // If the game does not exist, then return a 404 error
        const gameInfo = (await noblox.getPlaceInfo([id]))[0];
        if (!gameInfo) {
            res.status(404).json({ error: "Game does not exist" });
            return;
        }

        // Retrieve the user from the database using their Discord ID
        const user = await dbGet("SELECT * FROM users WHERE discord_id = ?", [req.user.id]);
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // If the game is already being tracked, return a 409 error
        const games = JSON.parse(user.games);
        if (games[gameInfo.placeId]) {
            res.status(409).json({ error: "Game is already tracked" });
            return;
        }

        // Add the game to the user's accounts in the database
        games[gameInfo.placeId] = {
            id: gameInfo.placeId,
            name: gameInfo.name,
            url: gameInfo.url
        }

        await dbRun("UPDATE users SET games = ? WHERE discord_id = ?", [JSON.stringify(games), req.user.id]);
        res.status(200).json({ message: "Game added successfully" });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;