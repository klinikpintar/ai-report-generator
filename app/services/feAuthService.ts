// import axios from "axios";

// const feAuthService = {
//     async login(email: string, password: string) {
//         try {
//             const response = await axios.post("/api/auth/login", { email, password });
//             localStorage.setItem("access_token", response.data.data.access_token);
//             return { success: true, message: "Login successful" };
//         } catch (error) {
//             const errorMessage = (error as any).response?.data?.message || "Login failed";
//             return { success: false, message: errorMessage };
//         }
//     },

//     async logout() {
//         try {
//             const token = localStorage.getItem("access_token");
//             await axios.post('/api/auth/logout', {}, {
//                 headers: {
//                     Authorization: `Bearer ${token}`  // Mengirim token di header
//                 }
//             });
//             localStorage.removeItem("access_token");
//             return true;
//         } catch (error) {
//             console.error("Logout failed", error);
//             return false;
//         }
//     },

//     async checkAuth() {
//         try {
//             const token = localStorage.getItem("access_token");

//             if (!token) {
//                 return false;
//             }

//             await axios.get("/api/auth/me", {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             });
//             return true;
//         } catch (error) {
//             console.error("Check auth failed", error);
//             return false;
//         }
//     }
// };

// export default feAuthService;

// import axios from "axios";

// // Tipe untuk response login
// type LoginResponse = {
//   success: boolean;
//   message: string;
//   accessToken?: string; // Opsional, hanya ada jika success
// };

// // Tipe untuk response logout
// type LogoutResponse = {
//   success: boolean;
//   message: string;
// };

// // Tipe untuk response checkAuth
// type CheckAuthResponse = {
//   isAuthenticated: boolean;
//   message?: string; // Opsional, hanya ada jika error
// };

// const feAuthService = {
//   async login(email: string, password: string): Promise<LoginResponse> {
//     try {
//       const response = await axios.post("/api/auth/login", { email, password });
//       const accessToken = response.data.data.access_token;
//       localStorage.setItem("access_token", accessToken);
//       return { success: true, message: "Login successful", accessToken };
//     } catch (error) {
//       const errorMessage = (error as any).response?.data?.message || "Login failed";
//       return { success: false, message: errorMessage };
//     }
//   },

//   async logout(): Promise<LogoutResponse> {
//     try {
//       const token = localStorage.getItem("access_token");
//       if (!token) {
//         return { success: false, message: "No token found" };
//       }

//       await axios.post('/api/auth/logout', {}, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       localStorage.removeItem("access_token");
//       return { success: true, message: "Logout successful" };
//     } catch (error) {
//       const errorMessage = (error as any).response?.data?.message || "Logout failed";
//       return { success: false, message: errorMessage };
//     }
//   },

//   async checkAuth(): Promise<CheckAuthResponse> {
//     try {
//       const token = localStorage.getItem("access_token");
//       if (!token) {
//         return { isAuthenticated: false, message: "No token found" };
//       }

//       await axios.get("/api/auth/me", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       return { isAuthenticated: true };
//     } catch (error) {
//       const errorMessage = (error as any).response?.data?.message || "Check auth failed";
//       return { isAuthenticated: false, message: errorMessage };
//     }
//   },
// };

// export default feAuthService;

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

      await axios.get("/api/auth/me", {
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