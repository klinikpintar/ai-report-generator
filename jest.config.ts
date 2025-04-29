import { Config } from "jest";

const config: Config = {
  projects: [
    "<rootDir>/jest.frontend.config.ts",
    "<rootDir>/jest.backend.config.ts",
  ],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "lcov", "text", "clover"],
  collectCoverageFrom: [
    "**/*.{ts,tsx, js, jsx}",
    "!app/config.ts",
    "!app/utils/exceptions.ts",
  ],  
  moduleNameMapper: {
    '^@frontend/(.*)$': '<rootDir>/app/(frontend)/$1',
    '^@backend/(.*)$': '<rootDir>/app/(backend)/$1',
    '^@/(.*)$': '<rootDir>/$1',
    '^react-markdown$': '<rootDir>/__mocks__/react-markdown.tsx', 
    '^rehype-raw$': '<rootDir>/__mocks__/rehype-raw.jsx',         
    '^remark-gfm$': '<rootDir>/__mocks__/remark-gfm.jsx',         
  },
  transformIgnorePatterns: [
    "node_modules/(?!react-markdown|remark-gfm|rehype-raw)", 
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default config;
