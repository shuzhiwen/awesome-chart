interface Window {
  awesome: AnyObject
  AWESOME_CHART?: {
    __env: {
      mode: 'development' | 'production'
    }
  }
}

declare module '*.css' {
  const classes: {readonly [key: string]: string}
  export default classes
}

declare module '*.png' {
  const image: string
  export default image
}
