import '@testing-library/jest-dom'
import dotenv from 'dotenv'

dotenv.config()

// jest.setup.js
// Silence console logs during tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});