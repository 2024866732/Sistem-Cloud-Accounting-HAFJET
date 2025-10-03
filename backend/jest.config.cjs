/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/__tests__'],
  // broaden roots so test discovery works consistently in CI/container
  // allow all files under src to be considered for test matching
  // (individual test patterns still apply)
  // Note: this helps when cwd/config resolution differs between environments
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts','js','json'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { diagnostics: false }]
  },
  collectCoverageFrom: [
    'src/services/**/*.ts',
    '!src/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  verbose: false
};
