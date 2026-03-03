# Chacko Mash Discord Bot

A Discord bot for Inovus Labs with birthday wishes, welcome messages, and more.

## Features

- Birthday notifications and image generation
- Hacktoberfest certificate generation
- Welcome messages for new members
- Health check server on `/health`
- Custom commands: $bot, $dm, /ping, /profile, /help

## Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Create `.env`:
   ```env
   DISCORDJS_BOT_TOKEN=your_bot_token
   TARGET_CHANNEL=channel_id
   LOBBY_CHANNEL=channel_id
   WELCOME_ROLE=role_id
   PRIORITY_ROLE_01=role_id
   PRIORITY_ROLE_02=role_id
   API_BASE_URL=your_api_url      # optional
   INOVUS_AUTH_TOKEN=token        # optional
   CLOUDFLARE_API_TOKEN=...       # optional - for D1 (Cloudflare API)
   CLOUDFLARE_ACCOUNT_ID=...      # optional - your Cloudflare account ID
   D1_DATABASE_ID=...             # optional - D1 database UUID
   EMAIL_SERVICE=gmail            # optional (for Hacktoberfest)
   EMAIL_USER=your_email
   EMAIL_PASS=your_password
   ```

3. Run
   ```bash
   npm start          # production
   npm run dev        # development with hot reload
   ```

## Commands

- `/help` - Show available commands
- `/ping` - Check bot latency
- `/edit-profile` - Update Inovus profile (DM only)
- `$bot | #channel | message` - Post message as bot
- `$dm | user_id | message` - Send DM to users/roles

## Docker

```bash
docker build -t chacko-mash .
docker run -d -p 3000:3000 --env-file .env chacko-mash
```
