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
  },
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
};

export default config;
