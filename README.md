# AntiScam Bot

Bans users who send scam links or NSFW Discord invites. Logs to a configurable channel.

---

## Features

- Detects scam links (Discord gift scams, Steam trade scams, crypto airdrops, short URLs)
- Detects NSFW Discord invites (invite + NSFW keywords in same message)
- Auto-bans sender + deletes message
- Skips server owner and admins
- Logs every action to a log channel
- Auto-creates `antiscam-logs` channel if none is set
- Per-server config stored in SQLite

---

## Setup

### 1. Discord Developer Portal

1. Go to https://discord.com/developers/applications
2. Create a new application
3. Go to **Bot** tab → Create bot → copy **Token**
4. Copy **Application ID** (on General Information tab) — this is your `CLIENT_ID`
5. Under **Bot** → enable:
   - `Server Members Intent`
   - `Message Content Intent`
6. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot permissions: `Ban Members`, `Manage Messages`, `Manage Channels`, `Send Messages`, `View Channels`, `Embed Links`
7. Use the generated URL to invite the bot to your server

### 2. Local / Register Commands

```bash
cp .env.example .env
# Fill in DISCORD_TOKEN and CLIENT_ID in .env

npm install
node src/register.js   # registers slash commands globally (takes ~1 hour to propagate)
node index.js          # start the bot
```

---

## Deploy on Railway

1. Push this repo to GitHub (exclude `.env` — add vars in Railway dashboard)
2. Go to https://railway.app → New Project → Deploy from GitHub repo
3. Add environment variables in Railway dashboard:
   - `DISCORD_TOKEN` = your bot token
   - `CLIENT_ID` = your application ID
4. Railway auto-detects `railway.toml` and runs `node index.js`
5. Done — bot stays online 24/7

> **Note:** Railway's free tier has sleep limits. Use a paid plan or Hobby plan ($5/mo) for always-on.

---

## Slash Commands (admin only)

| Command | Description |
|---|---|
| `/setlogchannel #channel` | Point logs to an existing channel |
| `/createlogchannel` | Auto-create `antiscam-logs` channel |
| `/status` | Check bot status + current log channel |

---

## File Structure

```
antiscam-bot/
├── index.js          # entry point
├── railway.toml      # Railway deploy config
├── package.json
├── .env.example
├── .gitignore
└── src/
    ├── bot.js        # main bot logic
    ├── detector.js   # scam/nsfw pattern matching
    ├── db.js         # SQLite config store
    └── register.js   # slash command registration
```
