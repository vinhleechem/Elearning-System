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
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let body: StandardApiResponse<T> | null = null;
  try {
    body = (await response.json()) as StandardApiResponse<T>;
  } catch {
    // ignore JSON parse errors; backend should always return JSON
  }

  if (!response.ok || body?.success === false) {
    // Nếu backend trả 401 (access token hết hạn) -> thử refresh access token bằng refresh token
    if (
      response.status === 401 &&
      !path.startsWith("/auth/login") &&
      !path.startsWith("/auth/register") &&
      !path.startsWith("/auth/refresh")
    ) {
      console.log("🔐 Nhận 401 Unauthorized, bắt đầu xử lý refresh token...");
      try {
        const raw = localStorage.getItem("auth-store");
        if (raw) {
          const stored = JSON.parse(raw) as {
            state?: {
              tokens?: {
                accessToken: string;
                refreshToken?: string;
              };
            };
          };

          const refreshToken = stored.state?.tokens?.refreshToken;

          if (refreshToken) {
            // Gọi thẳng API refresh token (không dùng httpClient để tránh đệ quy)
            console.log("🔄 Đang thử refresh token...");
            const refreshResponse = await fetch(
              `${API_BASE_URL}/auth/refresh`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: refreshToken }),
              },
            );

            type RefreshBody = StandardApiResponse<{ accessToken: string }>;
            let refreshBody: RefreshBody | null = null;
            try {
              refreshBody = (await refreshResponse.json()) as RefreshBody;
            } catch {
              // ignore
            }

            if (
              refreshResponse.ok &&
              refreshBody?.success !== false &&
              refreshBody?.data?.accessToken
            ) {
              console.log("✅ Refresh token thành công, nhận được access token mới");
              const newAccessToken = refreshBody.data.accessToken;

              // Cập nhật accessToken mới vào zustand store (giữ nguyên refreshToken cũ)
              try {
                const currentState = getAuthStoreState();
                if (currentState.tokens) {
                  currentState.updateAccessToken(newAccessToken);
                }
              } catch (e) {
                console.warn("Lỗi khi cập nhật token trong store:", e);
                // Fallback: cập nhật localStorage trực tiếp nếu store không khả dụng
                if (stored.state?.tokens) {
                  stored.state.tokens.accessToken = newAccessToken;
                  try {
                    localStorage.setItem("auth-store", JSON.stringify(stored));
                  } catch (storageError) {
                    console.warn("Lỗi khi cập nhật token trong localStorage:", storageError);
                  }
                }
              }

              // Thử gọi lại request ban đầu với accessToken mới
              const retryHeaders: Record<string, string> = {
                "Content-Type": "application/json",
              };
              const originalHeaders = options.headers ?? {};
              if (originalHeaders instanceof Headers) {
                originalHeaders.forEach((value, key) => {
                  retryHeaders[key] = value;
                });
              } else if (Array.isArray(originalHeaders)) {
                originalHeaders.forEach(([key, value]) => {
                  retryHeaders[key] = value;
                });
              } else {
                Object.assign(retryHeaders, originalHeaders);
              }

              // Gắn accessToken mới vào header Authorization (nếu có dùng)
              retryHeaders.Authorization = `Bearer ${newAccessToken}`;

              const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
                ...options,
                headers: retryHeaders,
              });

              let retryBody: StandardApiResponse<T> | null = null;
              try {
                retryBody =
                  (await retryResponse.json()) as StandardApiResponse<T>;
              } catch {
                // ignore
              }

              if (!retryResponse.ok || retryBody?.success === false) {
                console.log("❌ Retry request vẫn thất bại sau khi refresh token, chuyển về login");
                // Nếu retry vẫn lỗi -> refresh token cũng đã hết hạn, cần logout
                // Xóa auth store và redirect về login
                try {
                  localStorage.removeItem("auth-store");
                  if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
                    setTimeout(() => {
                      window.location.href = "/login";
                    }, 100);
                  }
                } catch (e) {
                  console.warn("Lỗi khi xóa auth-store sau refresh fail:", e);
                }
              } else {
                console.log("✅ Retry request thành công với access token mới");
                if (!retryBody) {
                  throw new ApiError(
                    "Empty response body",
                    retryResponse.status,
                  );
                }
                return retryBody;
              }
            } else {
              console.log("❌ Refresh token thất bại hoặc không nhận được access token mới");
              console.log("Refresh response status:", refreshResponse.status);
              console.log("Refresh response body:", refreshBody);

              // Refresh token đã hết hạn, cần đăng nhập lại
              try {
                localStorage.removeItem("auth-store");
                if (!isSessionExpiredNotified) {
                  isSessionExpiredNotified = true;
                  enqueueSnackbar("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", {
                    variant: "warning",
                    autoHideDuration: 5000,
                  });
                }
                // Delay redirect một chút để user thấy toast
                setTimeout(() => {
                  if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
                    window.location.href = "/login";
                  }
                }, 500);
              } catch (e) {
                console.warn("Lỗi khi xử lý logout sau refresh fail:", e);
              }
            }
          }
        }
      } catch (e) {
        // Nếu có lỗi trong quá trình refresh, tiếp tục xử lý 401 như bình thường
        // nhưng log nhẹ để debug nếu cần
        console.warn("❌ Lỗi khi refresh token:", e);
      }
    }

    // Nếu backend trả 401 (access token/refresh token hết hạn hoặc không hợp lệ)
    // -> tự động logout user ở FE (clear store) và điều hướng về trang đăng nhập
    // CHỈ logout nếu đã thử refresh token và vẫn fail, hoặc không có refresh token
    if (
      response.status === 401 &&
      !path.startsWith("/auth/login") &&
      !path.startsWith("/auth/register") &&
      !path.startsWith("/auth/refresh")
    ) {
      try {
        const raw = localStorage.getItem("auth-store");
        const hasValidTokens = raw && JSON.parse(raw)?.state?.tokens?.refreshToken;

        // Chỉ logout nếu không có refresh token hoặc refresh token đã fail ở trên
        // Tránh logout khi đang trong quá trình hot reload hoặc component mount
        if (!hasValidTokens) {
          // Xóa thông tin auth đã persist
          localStorage.removeItem("auth-store");

          // Nếu không đang ở trang login thì redirect về /login
          if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
            // Sử dụng setTimeout để tránh conflict với React rendering
            setTimeout(() => {
              window.location.href = "/login";
            }, 100);
          }
        }
      } catch (e) {
        // ignore storage errors
        console.warn("Lỗi khi xóa auth-store:", e);
      }
    }

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

