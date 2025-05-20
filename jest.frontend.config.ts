import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  dir: './',
});

const frontendConfig: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  roots: ['<rootDir>/__test__/frontend'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@frontend/(.*)$': '<rootDir>/app/(frontend)/$1',
    '^@/(.*)$': '<rootDir>/$1',
    '^react-markdown$': '<rootDir>/__mocks__/react-markdown.tsx',
    '^rehype-raw$': '<rootDir>/__mocks__/rehype-raw.jsx',
    '^remark-gfm$': '<rootDir>/__mocks__/remark-gfm.jsx',
    "^@prisma/client$": "<rootDir>/__mocks__/@prisma/client.ts",
  },
  transformIgnorePatterns: [
    "node_modules/(?!react-markdown|remark-gfm|rehype-raw)",
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/components/ui/'
  ],
};

export default createJestConfig(frontendConfig);
