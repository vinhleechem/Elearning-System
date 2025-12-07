import type {
  UserLoginResponse,
  UserResponse,
  UserLoginRequest,
  RegisterRequest,
} from "../types/auth";
import { httpClient } from "./httpClient";

export const authService = {
  login: async (payload: UserLoginRequest): Promise<UserLoginResponse> => {
    const response = await httpClient<UserLoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!response.data) {
      throw new Error("Không nhận được dữ liệu đăng nhập từ máy chủ");
    }
    return response.data;
  },
  register: async (payload: RegisterRequest): Promise<UserResponse> => {
    const response = await httpClient<UserResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!response.data) {
      throw new Error("Không nhận được dữ liệu người dùng sau khi đăng ký");
    }
    return response.data;
  },
  loginGoogle: async (code: string): Promise<UserLoginResponse> => {
    const response = await httpClient<UserLoginResponse>(
      `/auth/login-google?code=${encodeURIComponent(code)}`,
      {
        method: "POST",
      },
    );
    if (!response.data) {
      throw new Error("Không nhận được dữ liệu đăng nhập từ Google");
    }
    return response.data;
  },
  loginFacebook: async (code: string): Promise<UserLoginResponse> => {
    const response = await httpClient<UserLoginResponse>(
      `/auth/login-facebook?code=${encodeURIComponent(code)}`,
      {
        method: "GET",
      },
    );
    if (!response.data) {
      throw new Error("Không nhận được dữ liệu đăng nhập từ Facebook");
    }
    return response.data;
  },
  getProfile: async (accessToken: string): Promise<UserResponse> => {
    const response = await httpClient<UserResponse>("/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.data) {
      throw new Error("Không lấy được thông tin người dùng");
    }
    return response.data;
  },
  logout: async (accessToken: string): Promise<void> => {
    await httpClient<void>("/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  },
};
