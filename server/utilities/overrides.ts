import { logger } from '../bot/utilities/logger'

export function overrideConsole() {
  // const originalConsole = console

  console.log = (...args) => {
    logger.info(args.join(' '))
  }
  console.error = (...args) => {
    const firstArg = args.at(0)
    if (firstArg instanceof Error) {
      logger.error({ err: firstArg })
    } else {
      logger.error(args.join(' '))
    }
  }
  console.warn = (...args) => {
    logger.warn(args.join(' '))
  }
  console.info = (...args) => {
    logger.info(args.join(' '))
  }
}
