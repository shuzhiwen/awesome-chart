jest.mock('../src/utils/chaos', () => ({
  __esModule: true,
  ...jest.requireActual('../src/utils/chaos'),
  getTextWidth: jest.fn((text) => (text?.length > 5 ? 100 : 20)),
}))

jest.mock('../src/utils/create-log', () => ({
  __esModule: true,
  createLog: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  })),
}))
