import axiosInstance, { authAxiosInstance } from "./axiosInstance";
import { API_CONFIG } from "../config/apiConfig";

export type LoginPayload = {
  userNameOrEmail: string;
  password: string;
  twoFactorCode?: string | null;
  twoFactorRecoveryCode?: string | null;
};

export type RegisterPayload = {
  email: string;
  fullName: string;
  gender: number;
  password: string;
  phoneNumber?: string | null;
  university?: string | null;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  userId: string;
  token: string;
  newPassword: string;
};

export type ConfirmEmailPayload = {
  userId: string;
  token: string;
};

export type UpdateProfilePayload = {
  fullName?: string;
  gender?: number;
  university?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  coverUrl?: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type ChangeEmailPayload = {
  userId: string;
  newEmail: string;
};

export type RefreshTokenPayload = {
  refreshToken: string;
};

// Response type từ backend - Login
export type LoginResponse = {
  AccessToken: string;
  AccessExpiresAtUtc: string;
};

// Response type từ backend - Register
export type RegisterResponse = {
  Id: string;
  UserName: string;
  Email: string;
  FullName: string;
  EmailConfirmed: boolean;
};

const userService = {
  login(payload: LoginPayload) {
    return axiosInstance
      .post<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, payload)
      .then((res) => {
        // Map response từ backend (PascalCase) sang camelCase
        return {
          accessToken: res.data.AccessToken,
          refreshToken: res.data.AccessToken, // Backend không có refresh token, dùng access token
          expiresAt: res.data.AccessExpiresAtUtc,
        };
      });
  },

  googleLogin(payload: GoogleLoginPayload) {
    return axiosInstance
      .post<LoginResponse>(API_CONFIG.ENDPOINTS.AUTH.GOOGLE_LOGIN, payload)
      .then((res) => {
        return {
          accessToken: res.data.AccessToken,
          refreshToken: res.data.AccessToken,
          expiresAt: res.data.AccessExpiresAtUtc,
        };
      });
  },

  register(payload: RegisterPayload) {
    return axiosInstance
      .post<RegisterResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, payload)
      .then((res) => {
        // Map response từ backend
        return {
          id: res.data.Id,
          userName: res.data.UserName,
          email: res.data.Email,
          fullName: res.data.FullName,
          emailConfirmed: res.data.EmailConfirmed,
        };
      });
  },

  getProfile() {
    return authAxiosInstance.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE).then((res) => res.data);
  },

  logout() {
    return authAxiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT).then((res) => res.data);
  },

  // Password Reset
  sendPasswordResetEmail(payload: ForgotPasswordPayload, callbackBaseUrl?: string) {
    const url = callbackBaseUrl 
      ? `${API_CONFIG.ENDPOINTS.AUTH.PASSWORD_RESET_SEND}?callbackBaseUrl=${encodeURIComponent(callbackBaseUrl)}`
      : API_CONFIG.ENDPOINTS.AUTH.PASSWORD_RESET_SEND;
    
    return axiosInstance.post(url, payload).then((res) => res.data);
  },

  resetPassword(payload: ResetPasswordPayload) {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.PASSWORD_RESET, payload).then((res) => res.data);
  },

  // Email Confirmation
  confirmEmail(payload: ConfirmEmailPayload) {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.EMAIL_CONFIRM, payload).then((res) => res.data);
  },

  // Profile Management
  updateProfile(payload: UpdateProfilePayload) {
    return authAxiosInstance.put(API_CONFIG.ENDPOINTS.AUTH.PROFILE, payload).then((res) => res.data);
  },

  changePassword(payload: ChangePasswordPayload) {
    return authAxiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.PASSWORD_CHANGE, payload).then((res) => res.data);
  },

  // Email Management
  sendEmailConfirm(callbackBaseUrl: string) {
    const url = `${API_CONFIG.ENDPOINTS.AUTH.EMAIL_SEND_CONFIRM}?callbackBaseUrl=${encodeURIComponent(callbackBaseUrl)}`;
    return authAxiosInstance.post(url).then((res) => res.data);
  },

  sendEmailChange(payload: ChangeEmailPayload, callbackBaseUrl: string) {
    const url = `${API_CONFIG.ENDPOINTS.AUTH.EMAIL_SEND_CHANGE}?callbackBaseUrl=${encodeURIComponent(callbackBaseUrl)}`;
    return authAxiosInstance.post(url, payload).then((res) => res.data);
  },

  // Token Management
  refreshToken(payload: RefreshTokenPayload) {
    return axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH, payload).then((res) => {
      return {
        accessToken: res.data.AccessToken,
        expiresAt: res.data.AccessExpiresAtUtc,
      };
    });
  },
};

export default userService;
