import axios, {AxiosError} from "axios";
import {
  ILoginService,
  LoginResponse,
  ILogoutService,
  LogoutResponse
} from "../interfaces/IAuthServiceFE";

class FeAuthService implements ILoginService, ILogoutService {
  private static instance: FeAuthService;

  private constructor() { }

  static getInstance(): FeAuthService {
    if (!FeAuthService.instance) {
      FeAuthService.instance = new FeAuthService();
    }

    return FeAuthService.instance
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const accessToken = response.data.data.access_token;
      return { success: true, message: "Login successful", accessToken };
    } catch (error) {
      const axiosError = error as AxiosError<{message?: string}>;
      const errorMessage = axiosError.response?.data?.message ?? "Login failed";
      return { success: false, message: errorMessage };
    }
  }

  async logout(): Promise<LogoutResponse> {
    try {
      await axios.post('/api/auth/logout');
      return { success: true, message: "Logout successful" };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message ?? "Logout failed";
      return { success: false, message: errorMessage };
    }
  }

  async getUser() {
    try {
      const response = await axios.get("/api/auth/token/verify");
      return { success: true, data: response.data.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message ?? "Failed to fetch user data";
      return { success: false, message: errorMessage };
    }
  }
}

export default FeAuthService.getInstance();