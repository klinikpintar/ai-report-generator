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
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default config;
