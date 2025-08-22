## RBLX Private Server Tracker

Tracks the number of users in Roblox private servers for the games. This was originally created for streamers to display on their livestream.

### Features
- **Discord login** with OAuth2
- **Track games** by placeId
- **Realtime VIP server feed** via WebSockets

### Prerequisites
- Node.js
- A Discord application (for OAuth2)
- A dedicated Roblox account with a valid `.ROBLOSECURITY` cookie (for tracking)

### Environment configuration
Create a `.env` file in the project root using the `.env-template` file.

```env
# Web
PORT=3000
SERVER_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173

# Discord OAuth
DISCORD_CLIENT_ID=YOUR_DISCORD_APP_CLIENT_ID
DISCORD_CLIENT_SECRET=YOUR_DISCORD_APP_CLIENT_SECRET

# JWT
SECRET=change_this_to_a_long_random_string

# Roblox tracker
# The .ROBLOSECURITY cookie for a dedicated Roblox account used for tracking
ROBLOX_TRACKER_COOKIE=YOUR_ROBLOSECURITY_COOKIE
```

Notes:
- `CLIENT_URL` must match where the React app runs (Vite default is `http://localhost:5173`).
- `SERVER_URL` must match where the backend listens (default `http://localhost:3000`).

### Discord OAuth setup
In your Discord application settings:
- Add a Redirect URI: `http://localhost:3000/oauth/login` (or `${SERVER_URL}/oauth/login`).
- Use the Client ID and Client Secret in your `.env`.

### Install and run (development)
Open two terminals.

1) Backend (root)
```bash
npm install
npm start
```

2) Frontend (client)
```bash
cd client
npm install
npm run dev
```

### Security
- Keep `SECRET` and `ROBLOX_TRACKER_COOKIE` private. Use a dedicated Roblox account for tracking.