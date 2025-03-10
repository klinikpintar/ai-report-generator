import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Use a broader pattern to transform ESM modules
  transformIgnorePatterns: [
    'node_modules/(?!(react-markdown|rehype-raw|remark-gfm|micromark|mdast|unist|unified|bail|is-plain-obj|hast|ccount|character-entities|property-information|space-separated-tokens|comma-separated-tokens|vfile|trough|zwitch|web-namespaces|decode-named-character-reference|character-entities-legacy|character-reference-invalid|stringify-entities|character-entities-html4|trim-lines|devlop|escape-string-regexp)/)'
  ],
  
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^react-markdown$': '<rootDir>/__mocks__/react-markdown.tsx',
    '^remark-gfm$': '<rootDir>/__mocks__/remark-gfm.jsx',
    '^rehype-raw$': '<rootDir>/__mocks__/rehype-raw.jsx',
  },
  
  // Ensure we can handle ES modules
  extensionsToTreatAsEsm: ['.ts', '.tsx', '.jsx'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)