export function createLog(key: string) {
  const emptyData: any = 'Empty Data'

  return {
    info(message: string, data = emptyData) {
      console.info(`${key}: ${message}\n`, data)
    },
    warn(message: string, data = emptyData) {
      console.warn(`${key}: ${message}\n`, data)
    },
    error(message: string, data = emptyData) {
      console.error(`${key}: ${message}\n`, data)
    },
  }
}
