module.exports = {
  preset: '@shelf/jest-mongodb',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Maps your absolute imports (e.g., @/lib) to the src folder
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest', // Tells Jest to use ts-jest for .ts/.tsx files
  },
  modulePathIgnorePatterns: ['<rootDir>/playwright/'],
};
