import pino from 'pino'

const sharedOptions = {
  labels: {
    application: 'torkin-bot',
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  },
} as const

export const pinoLogger = pino({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport: {
    targets: [
      {
        target: 'pino-loki',
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
        options: {
          host: process.env.LOKI_HOST,
          basicAuth: {
            username: process.env.LOKI_USERNAME,
            password: process.env.LOKI_PASSWORD,
          },

          ...sharedOptions,
        },
      },
      {
        target: 'pino-pretty',
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
        options: {
          ...sharedOptions,
        },
      },
    ],
  },
})
