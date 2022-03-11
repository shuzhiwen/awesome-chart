export function createLog(file: string, scope: string) {
  const filePath = file.replace(/\./g, '\\.')
  const emptyData: any = 'Empty Data'

  return {
    info(message: string, data = emptyData) {
      console.info(`${scope}: ${message}`, `=> Path: '${filePath}'\n`, data)
    },
    warn(message: string, data = emptyData) {
      console.warn(`${scope}: ${message}`, `=> Path: '${filePath}'\n`, data)
    },
    error(message: string, data = emptyData) {
      console.error(`${scope}: ${message}`, `=> Path: '${filePath}'\n`, data)
    },
  }
}
