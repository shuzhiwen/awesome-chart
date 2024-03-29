export function createLog(key: string) {
  const isDebug = localStorage.getItem('AWESOME_MODE') === 'development'

  return {
    info(message: string, ...data: unknown[]) {
      console.info(`${key}: ${message}\n`, ...data)
    },
    warn(message: string, ...data: unknown[]) {
      console.warn(`${key}: ${message}\n`, ...data)
    },
    error(message: string, ...data: unknown[]) {
      console.error(`${key}: ${message}\n`, ...data)
    },
    /**
     * Only use for debugging.
     * @internal
     */
    debug: {
      info(message: string, ...data: unknown[]) {
        if (isDebug) {
          console.info(`(debug)${key}: ${message}\n`, ...data)
        }
      },
      warn(message: string, ...data: unknown[]) {
        if (isDebug) {
          console.warn(`(debug)${key}: ${message}\n`, ...data)
        }
      },
      error(message: string, ...data: unknown[]) {
        if (isDebug) {
          console.error(`(debug)${key}: ${message}\n`, ...data)
        }
      },
    },
  }
}
