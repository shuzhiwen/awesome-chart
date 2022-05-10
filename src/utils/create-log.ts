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
  }
}
