import { defineStore } from "pinia";
import apiClient from "@/utils/axios";
import axios from "axios";

import {
  type LoginPayload,
  type RegisterPayload,
  type TokenResponse,
  type RegisteredUser,
  type ApiErrorResponse,
  type AuthState,
} from "@/types/auth.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// console.log("API Base URL:", API_BASE_URL);

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    loading: false,
    error: null,
    user: null,
    registrationSuccess: false,
    loginSuccess: false,
    accessToken: null,
    refreshToken: null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.accessToken,
    getLoading: (state): boolean => state.loading,
    getError: (state): string | null => state.error,
    getUser: (state): RegisteredUser | null => state.user,
    getRegistrationSuccess: (state): boolean => state.registrationSuccess,
    getLoginSuccess: (state): boolean => state.loginSuccess,
    getAccessToken: (state): string | null => state.accessToken,
  },

  actions: {
    _setAuth(data: TokenResponse) {
      this.accessToken = data.access;
      this.refreshToken = data.refresh;

      localStorage.setItem("accessToken", data.access || "");
      localStorage.setItem("refreshToken", data.refresh || "");
      apiClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.access}`;
    },

    _clearAuth() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.loginSuccess = false;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      delete apiClient.defaults.headers.common["Authorization"];
    },

    resetAuthStatus() {
      this.registrationSuccess = false;
      this.loginSuccess = false;
      this.error = null;
    },

    async register(payload: RegisterPayload) {
      this.loading = true;
      this.resetAuthStatus();

      try {
        const response = await axios.post(`${API_BASE_URL}/register/`, payload);
        this.user = response.data;
        this.registrationSuccess = true;
        // console.log("Registration successful:", response.data);
      } catch (err: any) {
        if (axios.isAxiosError(err) && err.response) {
          const errorData: ApiErrorResponse = err.response.data;
          let errorMessage = "Registration failed";
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.errors) {
            errorMessage += " ";
            errorMessage += Object.entries(errorData.errors)
              .map(([key, value]) => `${key}: ${value.join(", ")}`)
              .join("; ");
          }
          this.error = errorMessage;
          console.error("Ошибка API при регистрации:", err.response.data);
        } else {
          this.error = "Произошла непредвиденная ошибка при регистрации.";
          console.error("Непредвиденная ошибка при регистрации:", err);
        }
      } finally {
        this.loading = false;
      }
    },

    async login(payload: LoginPayload) {
      this.loading = true;
      this.resetAuthStatus();

      this._clearAuth();

      try {
        const response = await axios.post<TokenResponse>(
          `${API_BASE_URL}/token/`,
          payload
        );
        this._setAuth(response.data);
        this.loginSuccess = true;
      } catch (err: any) {
        this._clearAuth();
        if (axios.isAxiosError(err) && err.response) {
          const errorData: ApiErrorResponse = err.response.data;
          let errorMessage = "Ошибка входа: ";
          errorMessage +=
            errorData.detail || "Неверное имя пользователя или пароль.";
          this.error = errorMessage;
        } else {
          this.error = "Произошла непредвиденная ошибка при входе.";
        }
      } finally {
        this.loading = false;
      }
    },
  },
});
