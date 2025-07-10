const { dbGet, dbRun } = require("../modules/database");
const { Router } = require("express");
const { isAuthenticated } = require("../modules/middleware");
const { retrieveRobloxTrackerFriends } = require("../modules/trackerBot");
const noblox = require("noblox.js");

const router = Router();

router.get('/api/account', isAuthenticated, async (req, res) => {
    try {
        const discordId = req.user.id;
        const user = await dbGet("SELECT * FROM users WHERE discord_id = ?", [discordId]);
        if (!user) {
            return res.status(401).json({ error: "Invalid account" });
        }

        const parsedAccounts = JSON.parse(user.accounts);
        const parsedGames = JSON.parse(user.games);
        const trackerFriends = (await retrieveRobloxTrackerFriends()).data;
        res.status(200).json({
            accounts: parsedAccounts,
            games: parsedGames,
            accountsNotTracked: Object.keys(parsedAccounts).filter(accountId => {
                return !trackerFriends.some(friend => String(friend.id) === accountId);
            })
        });
    } catch (err) {
        console.error("Error retrieving Roblox accounts", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/api/account', isAuthenticated, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Account name is required" });
        }

        // Search for the user by name
        const robloxAccount = (await noblox.searchUsers(name, 1, null))[0];

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
        const accounts = JSON.parse(user.accounts);
        if (accounts[robloxAccount.id]) {
            res.status(409).json({ error: "Account already exists" });
            return;
        }

        // Add the account to the user's accounts in the database
        accounts[robloxAccount.id] = {
            id: robloxAccount.id,
            name: robloxAccount.name
        }
        await dbRun("UPDATE users SET accounts = ? WHERE discord_id = ?", [JSON.stringify(accounts), req.user.id]);
        res.status(200).json({ message: "Account added successfully" });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: "Internal server error" });
    }
});

router.delete('/api/account', isAuthenticated, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Account name is required" });
        }

        // Retrieve the user from the database using their Discord ID
        const user = await dbGet("SELECT * FROM users WHERE discord_id = ?", [req.user.id]);
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Find the account to delete by name
        const accounts = JSON.parse(user.accounts);
        const accountIdToDelete = Object.keys(accounts).find(
            (id) => accounts[id].name === name
        );
        if (!accountIdToDelete) {
            return res.status(404).json({ error: "Account not found" });
        }

        // Remove the account
        delete accounts[accountIdToDelete];
        await dbRun("UPDATE users SET accounts = ? WHERE discord_id = ?", [JSON.stringify(accounts), req.user.id]);
        res.status(200).json({ message: "Account deleted successfully" });
    } catch (err) {
        console.error("Error deleting account", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;