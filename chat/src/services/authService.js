import api from "./api";

class AuthService {
  // baseUrl = "https://api.freeapi.app/api/v1/users";

  async register(userData) {
    try {
      const response = await api.post("/users/register", {
        email: userData.email,
        password: userData.password,
        username: userData.username,
        role: "USER",
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Registration failed";
    }
  }

  async login(credentials) {
    try {
      const response = await api.post("/users/login", credentials);
      const { accessToken, refreshToken } = response.data.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  }

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await api.post("/users/refresh-token", { refreshToken });
      const { accessToken: newAccessToken } = response.data.data;
      localStorage.setItem("accessToken", newAccessToken);
      return newAccessToken;
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      throw error.response?.data?.message || "Token refresh failed";
    }
  }

  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }
}

export const authService = new AuthService();
