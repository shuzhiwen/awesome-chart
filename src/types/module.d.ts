import 'fabric/fabric-impl'

declare module 'fabric/fabric-impl' {
  interface Object {
    className?: string
  }
  interface Group {
    className?: string
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

interface Window {
  awesome: AnyObject
  AWESOME_CHART?: {
    __env: {
      mode: 'development' | 'production'
    }
  }
}
