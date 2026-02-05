import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "../service/authService";
import type {
  UserLoginResponse,
  UserResponse,
  UserLoginRequest,
  RegisterRequest,
} from "../types/auth";
import { getErrorMessage } from "../libs/utils";
import { chatDB } from "../service/chatDB";
import { webSocketService } from "../service/webSocketService";

type AuthState = {
  tokens: UserLoginResponse | null;
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
  login: (payload: UserLoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserResponse | null) => void;
  setAuth: (
    accessToken: string,
    refreshToken: string,
    user: UserResponse,
  ) => void;
  updateAccessToken: (accessToken: string) => void;
  fetchProfile: () => Promise<UserResponse | null>;
  hasRole: (role: string) => boolean;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      tokens: null,
      user: null,
      loading: false,
      error: null,
      setUser: (user) => set(() => ({ user })),
      setAuth: (accessToken, refreshToken, user) => {
        set({
          tokens: { accessToken, refreshToken },
          user,
        });
      },
      updateAccessToken: (accessToken) => {
        const currentTokens = get().tokens;
        if (currentTokens) {
          set({
            tokens: { ...currentTokens, accessToken },
          });
        }
      },
      hasRole: (role: string) => {
        const { user } = get();
        if (!user?.roles) {
          return false;
        }
        return user.roles.some(
          (storedRole) =>
            storedRole === role ||
            storedRole === `ROLE_${role}` ||
            `ROLE_${storedRole}` === role,
        );
      },
      fetchProfile: async () => {
        const tokens = get().tokens;
        if (!tokens) {
          return null;
        }
        try {
          const user = await authService.getProfile(tokens.accessToken);
          set({ user });
          return user;
        } catch (error) {
          console.warn("Không thể tải thông tin người dùng:", error);
          return null;
        }
      },
      login: async (payload) => {
        set({ loading: true, error: null });
        try {
          const tokens = await authService.login(payload);
          set({ tokens });
          try {
            const user = await authService.getProfile(tokens.accessToken);
            set({ user, loading: false });
          } catch (profileError) {
            console.warn("Không thể tải thông tin người dùng:", profileError);
            set({ loading: false });
          }
        } catch (error) {
          set({ error: getErrorMessage(error), loading: false });
          throw error;
        }
      },
      register: async (payload) => {
        set({ loading: true, error: null });
        try {
          const user = await authService.register(payload);
          set({ user, loading: false });
        } catch (error) {
          set({ error: getErrorMessage(error), loading: false });
          throw error;
        }
      },
      logout: async () => {
        const tokens = get().tokens;
        try {
          // Gọi API logout nếu có token
          if (tokens?.accessToken) {
            await authService.logout(tokens.accessToken);
          }
        } catch (error) {
          // Log error nhưng vẫn clear local state
          console.warn("Logout API failed:", error);
        } finally {
          // Clear chat history (IndexedDB + localStorage)
          try {
            await chatDB.clearAll();
            localStorage.removeItem("chatbot_conversation_id");
            // Clear any cached messages
            Object.keys(localStorage).forEach((key) => {
              if (key.startsWith("chatbot_messages_")) {
                localStorage.removeItem(key);
              }
            });
          } catch (error) {
            console.warn("Failed to clear chat history:", error);
          }

          // Luôn clear state và tokens bất kể API có thành công hay không
          webSocketService.disconnect();
          set({ tokens: null, user: null, error: null });
          // Redirect về trang home
          window.location.href = "/";
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user,
      }),
    },
  ),
);

export const getAuthStoreState = () => useAuthStore.getState();
export const setAuthStoreState = useAuthStore.setState;
