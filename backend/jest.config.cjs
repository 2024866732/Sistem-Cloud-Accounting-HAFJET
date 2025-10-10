/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts','js','json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { 
      diagnostics: false,
      tsconfig: {
        module: 'commonjs',
        esModuleInterop: true
      }
    }]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  collectCoverageFrom: [
    'src/services/**/*.ts',
    '!src/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  verbose: false
};