import { getUserFromRequest } from '@/app/(backend)/utils/authUtils';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import config from '@/app/(backend)/config';

// Mock dependencies
jest.mock('next/headers', () => ({
  cookies: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

jest.mock('@/lib/prisma', () => ({
  user: {
    findUnique: jest.fn()
  }
}));

describe('authUtils', () => {
  describe('getUserFromRequest', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return user when valid access token is provided', async () => {
      // Mock cookies
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'valid-token' })
      };
      (cookies as jest.Mock).mockReturnValue(mockCookieStore);

      // Mock JWT verification
      const mockDecodedToken = { id: 'user-123' };
      (verify as jest.Mock).mockReturnValue(mockDecodedToken);

      // Mock database response
      const mockUser = { 
        id: 'user-123', 
        email: 'test@example.com', 
        role: 'ADMIN' 
      };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      // Execute function
      const result = await getUserFromRequest();

      // Assertions
      expect(mockCookieStore.get).toHaveBeenCalledWith('access_token');
      expect(verify).toHaveBeenCalledWith('valid-token', config.JWT_ACCESS_SECRET);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: { id: true, email: true, role: true }
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when no access token exists', async () => {
      // Mock empty cookies
      const mockCookieStore = {
        get: jest.fn().mockReturnValue(undefined)
      };
      (cookies as jest.Mock).mockReturnValue(mockCookieStore);

      // Execute function
      const result = await getUserFromRequest();

      // Assertions
      expect(mockCookieStore.get).toHaveBeenCalledWith('access_token');
      expect(verify).not.toHaveBeenCalled();
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when token verification fails', async () => {
      // Mock cookies
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'invalid-token' })
      };
      (cookies as jest.Mock).mockReturnValue(mockCookieStore);

      // Mock JWT verify failure
      (verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      // Execute function
      const result = await getUserFromRequest();

      // Assertions
      expect(verify).toHaveBeenCalledWith('invalid-token', config.JWT_ACCESS_SECRET);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when token payload has no id', async () => {
      // Mock cookies
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'token-missing-id' })
      };
      (cookies as jest.Mock).mockReturnValue(mockCookieStore);

      // Mock JWT verify with incomplete payload
      (verify as jest.Mock).mockReturnValue({ name: 'John Doe' });

      // Execute function
      const result = await getUserFromRequest();

      // Assertions
      expect(verify).toHaveBeenCalledWith('token-missing-id', config.JWT_ACCESS_SECRET);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when user not found in database', async () => {
      // Mock cookies
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'valid-token' })
      };
      (cookies as jest.Mock).mockReturnValue(mockCookieStore);

      // Mock JWT verification
      (verify as jest.Mock).mockReturnValue({ id: 'deleted-user-id' });

      // Mock database not finding user
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Execute function
      const result = await getUserFromRequest();

      // Assertions
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'deleted-user-id' },
        select: { id: true, email: true, role: true }
      });
      expect(result).toBeNull();
    });

    it('should return null when database query fails', async () => {
      // Mock cookies
      const mockCookieStore = {
        get: jest.fn().mockReturnValue({ value: 'valid-token' })
      };
      (cookies as jest.Mock).mockReturnValue(mockCookieStore);

      // Mock JWT verification
      (verify as jest.Mock).mockReturnValue({ id: 'user-123' });

      // Mock database error
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      // Spy on console.error
      jest.spyOn(console, 'error').mockImplementation(() => {});

      // Execute function
      const result = await getUserFromRequest();

      // Assertions
      expect(console.error).toHaveBeenCalled();
      expect(result).toBeNull();

      // Restore console.error
      (console.error as jest.Mock).mockRestore();
    });
  });
});