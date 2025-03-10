import axios from "axios";
import {
  ILoginService,
  LoginResponse,
  ILogoutService,
  LogoutResponse,
  ICheckAuthService,
  CheckAuthResponse,
} from "../interfaces/IAuthServiceFE";

class FeAuthService implements ILoginService, ILogoutService, ICheckAuthService {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const accessToken = response.data.data.access_token;
      localStorage.setItem("access_token", accessToken);
      return { success: true, message: "Login successful", accessToken };
    } catch (error) {
      const errorMessage = (error as any).response?.data?.message || "Login failed";
      return { success: false, message: errorMessage };
    }
  }

  async logout(): Promise<LogoutResponse> {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      await axios.post('/api/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      localStorage.removeItem("access_token");
      return { success: true, message: "Logout successful" };
    } catch (error) {
      const errorMessage = (error as any).response?.data?.message || "Logout failed";
      return { success: false, message: errorMessage };
    }
  }

  async checkAuth(): Promise<CheckAuthResponse> {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        return { isAuthenticated: false, message: "No token found" };
      }

      await axios.get("/api/auth/token/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { isAuthenticated: true };
    } catch (error) {
      const errorMessage = (error as any).response?.data?.message || "Check auth failed";
      return { isAuthenticated: false, message: errorMessage };
    }
  }
}

export default FeAuthService;