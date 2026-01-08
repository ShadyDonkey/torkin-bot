import { botLogger } from '../bot/utilities/logger'

export function overrideConsole() {
  // const originalConsole = console

  console.log = (...args) => {
    botLogger.info(args.join(' '))
  }
  console.error = (...args) => {
    const firstArg = args.at(0)
    if (firstArg instanceof Error) {
      botLogger.error({ err: firstArg })
    } else {
      botLogger.error(args.join(' '))
    }
  }
  console.warn = (...args) => {
    botLogger.warn(args.join(' '))
  }
  console.info = (...args) => {
    botLogger.info(args.join(' '))
  }
}
