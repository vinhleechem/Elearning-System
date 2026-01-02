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
import { enqueueSnackbar } from "notistack";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

let isSessionExpiredNotified = false;

export const httpClient = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<StandardApiResponse<T>> => {
  const state = getAuthStoreState();
  const accessToken = state.tokens?.accessToken;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> ?? {}),
  };

  // Only set Content-Type if not uploading FormData
  // Browser will automatically set correct Content-Type with boundary for FormData
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  // Make the request
  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Parse response
  let body: StandardApiResponse<T> | null = null;
  try {
    body = (await response.json()) as StandardApiResponse<T>;
  } catch {
    // Ignore JSON parse errors
  }

  // Handle 401 Unauthorized - Try refresh token
  if (response.status === 401 && !path.includes("/auth/")) {
    const refreshed = await tryRefreshToken();

    if (refreshed) {
      // Retry with new token
      headers.Authorization = `Bearer ${refreshed}`;
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });

      try {
        body = (await response.json()) as StandardApiResponse<T>;
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
      body ?? undefined,
    );
  }

  if (!body) {
    throw new ApiError("Empty response body", response.status);
  }

  return body;
};

// Helper: Try to refresh access token
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

    const result = (await response.json()) as StandardApiResponse<{ accessToken: string }>;
    const newToken = result.data?.accessToken;

    if (!newToken) return null;

    // Update token in store
    const currentState = getAuthStoreState();
    if (currentState.tokens) {
      currentState.updateAccessToken(newToken);

      // Trigger WebSocket reconnection with new token
      // We dispatch a custom event that NotificationBell can listen to
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

// Helper: Logout user and redirect
function handleLogout() {
  try {
    localStorage.removeItem("auth-store");

    if (!isSessionExpiredNotified) {
      isSessionExpiredNotified = true;
      enqueueSnackbar("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
        variant: "warning",
        autoHideDuration: 3000,
      });
    }

    // Redirect to login
    if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  } catch (error) {
    console.error("Logout failed:", error);
  }
}


