export {}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production'
    DRAGONFLY_URL: string
    TVDB_API_KEY: string
    DISCORD_TOKEN: string
    DEV_GUILD_ID: string
    DISCORD_APP_ID: string
    DISCORD_PUBLIC_KEY: string
    TMDB_API_KEY: string
  }
}
