import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const backendConfig: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "ts-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!jose)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  roots: ["<rootDir>/__test__/backend"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^jose$": "<rootDir>/__mocks__/jose.ts",
    "^@backend/(.*)$": "<rootDir>/app/(backend)/$1",
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default createJestConfig(backendConfig);