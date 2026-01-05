import pino from 'pino'

export const transport = pino.transport({
  targets: [
    {
      target: 'pino-loki',
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
      options: {
        labels: {
          application: 'torkin-bot',
          environment: process.env.NODE_ENV,
          version: process.env.npm_package_version,
        },

        host: process.env.LOKI_HOST,
        basicAuth: {
          username: process.env.LOKI_USERNAME,
          password: process.env.LOKI_PASSWORD,
        },
      },
    },
    {
      target: 'pino-pretty',
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
      options: {},
    },
  ],
})

// export const logger = pino(transport)
