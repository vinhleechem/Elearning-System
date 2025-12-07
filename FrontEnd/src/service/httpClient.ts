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

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

export const httpClient = async <T>(
  path: string,
  options: RequestInit = {},
): Promise<StandardApiResponse<T>> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
  };

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
              const newAccessToken = refreshBody.data.accessToken;

              // Cập nhật accessToken mới vào localStorage (giữ nguyên refreshToken cũ)
              if (stored.state?.tokens) {
                stored.state.tokens.accessToken = newAccessToken;
                localStorage.setItem("auth-store", JSON.stringify(stored));
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
                // Nếu retry vẫn lỗi -> sẽ rơi xuống nhánh logout bên dưới
              } else {
                if (!retryBody) {
                  throw new ApiError(
                    "Empty response body",
                    retryResponse.status,
                  );
                }
                return retryBody;
              }
            }
          }
        }
      } catch (e) {
        // Nếu có lỗi trong quá trình refresh, tiếp tục xử lý 401 như bình thường
        // nhưng log nhẹ để debug nếu cần
        console.warn("Lỗi khi refresh token:", e);
      }
    }

    // Nếu backend trả 401 (access token/refresh token hết hạn hoặc không hợp lệ)
    // -> tự động logout user ở FE (clear store) và điều hướng về trang đăng nhập
    if (
      response.status === 401 &&
      !path.startsWith("/auth/login") &&
      !path.startsWith("/auth/register") &&
      !path.startsWith("/auth/refresh")
    ) {
      try {
        // Xóa thông tin auth đã persist
        localStorage.removeItem("auth-store");
      } catch (e) {
        // ignore storage errors
        console.warn("Lỗi khi xóa auth-store:", e);
      }

      // Nếu không đang ở trang login thì redirect về /login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
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

