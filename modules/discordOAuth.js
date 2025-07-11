async function getTokens(code) {
    const tokenResponseData = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: new URLSearchParams({
            client_id: process.env.DISCORD_CLIENT_ID,
            client_secret: process.env.DISCORD_CLIENT_SECRET,
            code,
            grant_type: "authorization_code",
            redirect_uri: `${process.env.SERVER_URL}/oauth/login` ?? `http://localhost:${process.env.PORT}/oauth/login`,
            scope: "identify",
        }).toString(),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    return await tokenResponseData.json();
}

async function getUserData(accessToken) {
    const userResponse = await fetch("https://discord.com/api/users/@me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return await userResponse.json();
}

module.exports = {
    getTokens,
    getUserData
}