const noblox = require("noblox.js");

let robloxTrackerId = 0;

// Initialize the bot by setting the Roblox tracker cookie
function initializeBot() {
    noblox.setCookie(process.env.ROBLOX_TRACKER_COOKIE).then((accountInfo) => {
        if (!accountInfo.id) {
            console.error("Failed to set Roblox tracker cookie. Please check your .env file.");
            process.exit(1); // Exit the application if the cookie is invalid
        }
        robloxTrackerId = accountInfo.id;

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
}

// Retrieves the friends of the Roblox tracker account
function retrieveRobloxTrackerFriends() {
    return new Promise((resolve, reject) => {
        noblox.getFriends(robloxTrackerId).then((friends) => {
            resolve(friends);
        }).catch((err) => {
            console.error("Error retrieving Roblox tracker friends:", err);
        });
    })
}

module.exports = {
    initializeBot,
    retrieveRobloxTrackerFriends,
    robloxTrackerId
}