# Torkin Bot

![License: Source Available](https://img.shields.io/badge/License-Source%20Available-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Bun](https://img.shields.io/badge/Bun-Latest-black)

## Overview

A Discord bot for discovering movies and TV shows, powered by TMDB and TVDB APIs. Made for Buildathon 2025 because going to all the different sites to get show and movie info can be tedious.

## Quick Start

```bash
# Clone and install
git clone git@github.com:ShadyDonkey/torkin-bot.git && cd torkin-bot
bun install

# Start infrastructure
docker-compose up -d

# Configure environment
cp server/.env.example server/.env
# Edit .env with your API keys

# Build and run
cd server
bun run bot:build && bun run main.ts
```

Visit `http://localhost:3000/install-commands` to register Discord commands.

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

## Architecture

### Request Flow

1. Discord sends interaction events to `/discord/handle-interaction`
2. Elysia routes to Dressed handler which matches commands/components
3. Command handlers interact with TMDB/TVDB APIs for data
4. Results are cached in Keyv/Dragonfly for performance
5. Database operations use ZenStack ORM for persistence
6. Rich UI components built with React syntax are returned

### Environment Variables

| Variable             | Description                          | Required |
| -------------------- | ------------------------------------ | -------- |
| `NODE_ENV`           | Environment (development/production) | Yes      |
| `DATABASE_URL`       | PostgreSQL connection string         | Yes      |
| `LOKI_HOST`          | Loki logging endpoint                | Yes      |
| `LOKI_USERNAME`      | Loki auth username                   | Optional |
| `LOKI_PASSWORD`      | Loki auth password                   | Optional |
| `DISCORD_TOKEN`      | Bot authentication token             | Yes      |
| `DISCORD_APP_ID`     | Discord application ID               | Yes      |
| `DISCORD_PUBLIC_KEY` | Public key for verify                | Yes      |
| `DEV_GUILD_ID`       | Development server ID                | Optional |
| `TMDB_API_KEY`       | TheMovieDB API key                   | Yes      |
| `TVDB_API_KEY`       | TheTVDB API key                      | Yes      |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the project's code style
4. Run `biome check --write` before committing
5. Commit your changes following conventional commit guidelines (`git commit -m 'feat: amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

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

## Infrastructure

### Services

The project uses Docker Compose to manage local infrastructure:

- **PostgreSQL**: Primary database for persistent storage
- **Dragonfly**: High-performance Redis-compatible cache
- **Grafana**: Visualization for metrics and logs
- **Loki**: Log aggregation and query system

All services are configured with persistent volumes and appropriate networking.

## License

This project is source-available for reference purposes only.
See [LICENSE](LICENSE) for full details.
