interface RegisterData {
  email: string;
  password: string;
  username: string;
  fullName: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  data: {
    user: {
      _id: string;
      username: string;
      email: string;
      role: string;
    };
    accessToken: string;
  };
  statusCode: number;
  message: string;
  success: boolean;
}

class AuthService {
  private baseUrl = "https://api.freeapi.app/api/v1/users";

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
        username: userData.username,
        role: "USER",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  }

  async login(credentials: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  }
}

export const authService = new AuthService();
