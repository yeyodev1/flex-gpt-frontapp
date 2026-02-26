import APIBase from "./httpBase";
import type { LoginResponse } from "@/types";

class AuthService extends APIBase {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>("auth/login", {
      email,
      password,
    });
    return response.data;
  }

  async getProfile() {
    const response = await this.get<{ user: LoginResponse["user"] }>("auth/profile");
    return response.data;
  }
}

export const authService = new AuthService();
