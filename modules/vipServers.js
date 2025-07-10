async function getVIPServers(gameId) {
    const response = await fetch(`https://games.roblox.com/v1/games/${gameId}/private-servers?cursor=`, {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9,ar;q=0.8",
            "cookie": ".ROBLOSECURITY=" + process.env.ROBLOX_TRACKER_COOKIE,
        },
        "body": null,
        "method": "GET"
    });

    const data = await response.json();
    if (data.errors) {
        return new Promise((resolve) => {
            setTimeout(async () => {
                const result = await getVIPServers(gameId);
                resolve(result);
            }, 500);
        });
    }

    return data;
}

module.exports = {
    getVIPServers
};