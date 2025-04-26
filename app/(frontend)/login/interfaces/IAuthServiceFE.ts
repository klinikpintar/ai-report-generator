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