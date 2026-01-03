interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

interface ApiError {
  message: string;
  statusCode: number;
}

class AuthService {
  private tokenKey = "auth_token";
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

  async register(email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email, password}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `Registration failed with status: ${response.status}`
        );
      }

      this.setToken(data.token);
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({email, password}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      this.setToken(data.token);
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/validate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.tokenKey);
    }
    // Optional: Clear any other user data
    window.location.href = "/login";
  }

  getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch {
      return null;
    }
  }
}

export const authService = new AuthService();
