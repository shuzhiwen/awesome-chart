/* eslint-disable @typescript-eslint/no-unused-vars */

type Env = {
  mode: 'development' | 'production'
}

const developmentEnv: Env = {
  mode: 'development',
}

const productionEnv: Env = {
  mode: 'production',
}

export const __env = productionEnv
