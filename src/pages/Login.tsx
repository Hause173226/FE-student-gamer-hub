import React, { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import userService, { LoginPayload } from "../services/userService";
import { useAuth } from "../contexts/AuthContext";
import { Trophy } from "lucide-react";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<LoginPayload>({
    userNameOrEmail: "",
    password: "",
    twoFactorCode: null,
    twoFactorRecoveryCode: null,
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.userNameOrEmail || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    try {
      const response = await userService.login(formData);

      if (response.accessToken) {
        login(response.accessToken, response.refreshToken);
        navigate("/");
      } else {
        setError("Đăng nhập thất bại: Không nhận được token");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    if (!credentialResponse.credential) {
      setError("Đăng nhập Google thất bại: Không nhận được credential");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log("Google credential:", credentialResponse.credential);

      const response = await userService.googleLogin({
        idToken: credentialResponse.credential, // ✅ Đúng - ID Token
      });

      console.log("Google login response:", response);

      if (response.accessToken) {
        login(response.accessToken, response.refreshToken);
        navigate("/");
      } else {
        setError("Đăng nhập Google thất bại: Không nhận được token");
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Đăng nhập Google thất bại. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">SGH</h1>
            <p className="text-slate-400 text-sm">Student Gamer Hub</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="userNameOrEmail"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Email
              </label>
              <input
                id="userNameOrEmail"
                name="userNameOrEmail"
                type="text"
                required
                value={formData.userNameOrEmail}
                onChange={handleChange}
                placeholder="Nhập Email..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Mật Khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu..."
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/50 hover:-translate-y-1 active:translate-y-0"
            >
              {loading ? "Đang Đăng Nhập..." : "Đăng Nhập"}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800 text-slate-400">hoặc</span>
              </div>
            </div>

            {/* Google Login with Custom Styling */}
            <div className="flex justify-center  transition-all duration-200 hover:-translate-y-1 active:translate-y-0">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                auto_select={false}
                width="400"
              />
            </div>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm">
            <Link
              to="/register"
              className="text-slate-400 hover:text-indigo-400 transition-colors"
            >
              Chưa có tài khoản?
            </Link>
            <Link
              to="/forgot-password"
              className="text-slate-400 hover:text-indigo-400 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
        </div>
      </div>

      {/* Custom CSS for Google Login Button */}
    </div>
  );
};

export default Login;
