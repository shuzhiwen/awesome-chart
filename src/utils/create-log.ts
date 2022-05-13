import {__env} from '../env'

const isDebug = __env.mode === 'development'

export function createLog(key: string) {
  return {
    info(message: string, ...data: any[]) {
      console.info(`${key}: ${message}\n`, ...data)
    },
    warn(message: string, ...data: any[]) {
      console.warn(`${key}: ${message}\n`, ...data)
    },
    error(message: string, ...data: any[]) {
      console.error(`${key}: ${message}\n`, ...data)
    },
    debug: {
      info(message: string, ...data: any[]) {
        if (isDebug) {
          console.info(`(debug)${key}: ${message}\n`, ...data)
        }
      },
      warn(message: string, ...data: any[]) {
        if (isDebug) {
          console.warn(`(debug)${key}: ${message}\n`, ...data)
        }
      },
      error(message: string, ...data: any[]) {
        if (isDebug) {
          console.error(`(debug)${key}: ${message}\n`, ...data)
        }
      },
    },
  }
}
