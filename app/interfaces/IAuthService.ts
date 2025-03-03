export interface Payload {
  id: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface IAuthService {
  /**
   * Generate Access Token
   * @param payload - Data payload (id, role)
   * @returns {string} Access Token
   */
  generateAccessToken(payload: Payload): string;

  /**
   * Generate Refresh Token
   * @param payload - Data payload (id)
   * @returns {Promise<string>} Refresh Token
   */
  generateRefreshToken(payload: Payload): Promise<string>;

  /**
   * Verify and Decode JWT Token
   * @param token - JWT token to verify
   * @param secret - Secret key to verify the token
   * @returns Decoded payload or null if invalid
   */
  verifyToken(token: string, secret: string): Payload | null;
}
