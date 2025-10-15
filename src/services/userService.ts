import axiosInstance from "./axiosInstance";

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

export type GoogleLoginPayload = {
  idToken: string;
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
      .post<LoginResponse>("/Auth/login", payload)
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
      .post<LoginResponse>("/GoogleAuth/login", payload)
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
      .post<RegisterResponse>("/Auth/user-register", payload)
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
    return axiosInstance.get("/Auth/me").then((res) => res.data);
  },

  logout() {
    return axiosInstance.post("/Auth/revoke").then((res) => res.data);
  },
};

export default userService;
