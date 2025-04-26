import axios from 'axios';
import FeAuthService from '@frontend/login/services/feAuthService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FeAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    test('should return success response when login succeeds', async () => {
      // Setup mock response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          message: 'Login successful',
          data: { access_token: 'mock-access-token' }
        }
      });

      const result = await FeAuthService.login('test@example.com', 'password123');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/auth/login', 
        { email: 'test@example.com', password: 'password123' }
      );
      expect(result).toEqual({
        success: true,
        message: 'Login successful',
        accessToken: 'mock-access-token'
      });
    });

    test('should return error response when login fails', async () => {
      // Setup mock response for failure
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Invalid credentials'
          }
        }
      });

      const result = await FeAuthService.login('wrong@example.com', 'wrongpass');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/auth/login', 
        { email: 'wrong@example.com', password: 'wrongpass' }
      );
      expect(result).toEqual({
        success: false,
        message: 'Invalid credentials'
      });
    });

    test('should handle error with no response data', async () => {
      // Setup mock response for network error
      mockedAxios.post.mockRejectedValueOnce({
        // No response object
      });

      const result = await FeAuthService.login('test@example.com', 'password');

      expect(result).toEqual({
        success: false,
        message: 'Login failed'
      });
    });
  });

  describe('logout', () => {
    test('should return success response when logout succeeds', async () => {
      // Setup mock response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          message: 'Logout successful'
        }
      });

      const result = await FeAuthService.logout();

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/logout');
      expect(result).toEqual({
        success: true,
        message: 'Logout successful'
      });
    });

    test('should return error response when logout fails', async () => {
      // Setup mock response for failure
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Failed to logout'
          }
        }
      });

      const result = await FeAuthService.logout();

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/auth/logout');
      expect(result).toEqual({
        success: false,
        message: 'Failed to logout'
      });
    });

    test('should handle error with no response data during logout', async () => {
      // Setup mock response for network error
      mockedAxios.post.mockRejectedValueOnce({
        // No response object
      });

      const result = await FeAuthService.logout();

      expect(result).toEqual({
        success: false,
        message: 'Logout failed'
      });
    });
  });

  // Test singleton pattern
  describe('getInstance', () => {
    test('should always return the same instance', () => {
      // Access the getInstance method through a workaround since it's private
      // for testing purposes only
      const FeAuthServiceClass = require('@frontend/login/services/feAuthService').default.constructor;
      
      const instance1 = FeAuthServiceClass.getInstance();
      const instance2 = FeAuthServiceClass.getInstance();
      
      // The two instances should be the same object
      expect(instance1).toBe(instance2);
    });
  });
});