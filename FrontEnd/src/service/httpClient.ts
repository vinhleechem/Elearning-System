export type StandardApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
};

export class ApiError extends Error {
  status: number;
  payload?: StandardApiResponse<unknown>;

  constructor(message: string, status: number, payload?: StandardApiResponse<unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

import { getAuthStoreState } from "../store/authStore";
import { toast } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

let isSessionExpiredNotified = false;

export const httpClient = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<StandardApiResponse<T>> => {
  const state = getAuthStoreState();
  const accessToken = state.tokens?.accessToken;

  // Build headers
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Auto set Content-Type for JSON (skip for FormData)
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Auto add Authorization token
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  // Make request
  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Parse JSON response
  let body: StandardApiResponse<T> | null = null;
  try {
    body = await response.json();
  } catch {
    // Ignore parse errors
  }

  // Handle 401 - Auto refresh token
  if (response.status === 401 && !path.includes("/auth/")) {
    const newToken = await tryRefreshToken();

    if (newToken) {
      // Retry with new token
      headers.Authorization = `Bearer ${newToken}`;
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });

      try {
        body = await response.json();
      } catch {
        // Ignore
      }
    } else {
      // Refresh failed - logout
      handleLogout();
    }
  }

  // Handle errors
  if (!response.ok || body?.success === false) {
    throw new ApiError(
      body?.message ?? `Request failed with status ${response.status}`,
      response.status,
      body,
    );
  }

  if (!body) {
    throw new ApiError("Empty response body", response.status);
  }

  return body;
};

// Helper: Refresh access token
async function tryRefreshToken(): Promise<string | null> {
  try {
    const raw = localStorage.getItem("auth-store");
    if (!raw) return null;

    const stored = JSON.parse(raw) as {
      state?: { tokens?: { refreshToken?: string } };
    };

    const refreshToken = stored.state?.tokens?.refreshToken;
    if (!refreshToken) return null;

    // Call refresh endpoint
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (!response.ok) return null;

    const result = await response.json() as StandardApiResponse<{ accessToken: string }>;
    const newToken = result.data?.accessToken;

    if (!newToken) return null;

    // Update token in store
    const currentState = getAuthStoreState();
    if (currentState.tokens) {
      currentState.updateAccessToken(newToken);

      // Notify WebSocket to reconnect
      window.dispatchEvent(new CustomEvent('token-refreshed', {
        detail: { accessToken: newToken }
      }));
    }

    return newToken;
  } catch (error) {
    console.error("Refresh token failed:", error);
    return null;
  }
}

// Helper: Logout and redirect
function handleLogout() {
  localStorage.removeItem("auth-store");

  // Show toast once
  if (!isSessionExpiredNotified) {
    isSessionExpiredNotified = true;
    toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
      duration: 3000,
    });
  }

  // Redirect to login
  const currentPath = window.location.pathname;
  if (currentPath !== "/login" && currentPath !== "/register") {
    window.location.href = "/login";
  }
}
