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
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};

export default config;
