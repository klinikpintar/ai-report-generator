export interface ILoginService {
  /**
   * Login with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns {Promise<LoginResponse>} Response object containing success status, message, and optional access token
   */
  login(email: string, password: string): Promise<LoginResponse>;
}

export type LoginResponse = {
  /**
   * Indicates whether the login was successful
   */
  success: boolean;

  /**
   * Message describing the result of the login attempt
   */
  message: string;

  /**
   * Access token (only exists if login is successful)
   */
  accessToken?: string;
};

export interface ILogoutService {
  /**
   * Logout the current user
   * @returns {Promise<LogoutResponse>} Response object containing success status and message
   */
  logout(): Promise<LogoutResponse>;
}

export type LogoutResponse = {
  /**
   * Indicates whether the logout was successful
   */
  success: boolean;

  /**
   * Message describing the result of the logout attempt
   */
  message: string;
};

export interface ICheckAuthService {
  /**
   * Check if the user is authenticated
   * @returns {Promise<CheckAuthResponse>} Response object containing authentication status and message
   */
  checkAuth(): Promise<CheckAuthResponse>;
}

export type CheckAuthResponse = {
  /**
   * Indicates whether the user is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Message describing the authentication status (e.g., error message)
   */
  message: string;
};