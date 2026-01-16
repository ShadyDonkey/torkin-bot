import pino from 'pino'
import pinoStdSerializers from 'pino-std-serializers'
import packageJson from '../../package.json'

const sharedOptions = {
  labels: {
    application: 'torkin-bot',
    environment: process.env.NODE_ENV,
    version: packageJson.version,
  },
} as const

export const pinoLogger = pino({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  serializers: {
    err: pinoStdSerializers.err,
    error: pinoStdSerializers.err,
  },
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
