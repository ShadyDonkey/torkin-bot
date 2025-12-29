# Torkin Bot

![License: Source Available](https://img.shields.io/badge/License-Source%20Available-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Bun](https://img.shields.io/badge/Bun-Latest-black)

A Discord bot for discovering movies and TV shows, powered by TMDB and TVDB APIs.

## Tech Stack

### Core

- **Runtime**: Bun
- **Language**: TypeScript 5.9+ (strict mode)
- **Framework**: Elysia
- **Discord Framework**: Dressed

### Database & Caching

- **Database**: PostgreSQL
- **ORM**: ZenStack + Kysely
- **Cache**: Keyv with Dragonfly

### External APIs

- **TMDB**: TheMovieDB API for movie/TV data
- **TVDB**: TheTVDB API for TV show metadata
- **IMDB**: Additional metadata

### Observability

- **Logging**: Pino with Loki integration
- **Monitoring**: Grafana/OTel LGTM stack

## Prerequisites

- Bun 1.3+
- Docker & Docker Compose (or Podman with Docker Compose compatibility enabled)
- Discord Application with bot token and public key
- TMDB API Key
- TVDB API Key

## Installation

1. **Clone the repository**

   ```bash
   git clone git@github.com:ShadyDonkey/torkin-bot.git
   cd torkin-bot
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Start services**

   ```bash
   docker-compose up -d
   ```

   This starts PostgreSQL, Dragonfly (Redis), and the LGTM stack (Grafana + Loki).

4. **Configure environment variables**

   ```bash
   cp server/.env.example server/.env
   ```

5. **Fill in required environment variables**:

   ```env
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres:secret@localhost:5432/postgres
   LOKI_HOST=http://localhost:3100
   LOKI_USERNAME=
   LOKI_PASSWORD=

   # Discord
   DISCORD_TOKEN=your_bot_token
   DISCORD_APP_ID=your_app_id
   DISCORD_PUBLIC_KEY=your_public_key
   DEV_GUILD_ID=optional_development_guild_id

   # External Provider
   TVDB_API_KEY=your_tvdb_api_key
   TMDB_API_KEY=your_tmdb_api_key
   ```

## Development

### Observability

- **Grafana**: http://localhost:3001
- **Loki API**: http://localhost:3100

### Database Migrations

ZenStack handles database schema management. Models are defined in `server/zenstack/schemas/`.

## Project Structure

```
torkin-bot/
├── server/
│   ├── bot/                 # Discord bot logic
│   │   ├── commands/        # Slash commands
│   │   ├── components/      # Interactive components
│   │   └── utilities/       # Bot-specific utilities
│   ├── lib/                 # Core libraries
│   │   ├── tmdb/           # TMDB API client
│   │   ├── tvdb/           # TVDB API client
│   │   ├── db.ts           # Database client
│   │   └── keyv.ts         # Cache client
│   ├── utilities/          # Shared utilities
│   └── zenstack/           # Database schemas
└── README.md
```

## License

This project is source-available for reference purposes only.
See [LICENSE](LICENSE) for full details.
