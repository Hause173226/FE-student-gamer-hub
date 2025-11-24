import React, { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import userService, { LoginPayload } from "../services/userService";
import { useAuth } from "../contexts/AuthContext";
import DashboardService, { DashboardResponse, TodayQuest, TodayEvent } from "../services/dashboardService";
import GameService from "../services/gameService";
import { Trophy, Star, Users, Calendar, Clock, CheckCircle, Circle, Gamepad2 } from "lucide-react";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState<LoginPayload>({
    userNameOrEmail: "",
    password: "",
    twoFactorCode: null,
    twoFactorRecoveryCode: null,
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  
  // Animation states
  const [boxFlewIn, setBoxFlewIn] = useState<boolean>(false);
  const [showWelcomeText, setShowWelcomeText] = useState<boolean>(true);
  const [showLoginForm, setShowLoginForm] = useState<boolean>(false);
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const welcomeText = "Chào mừng đến với Student Gamer Hub";
  const [displayedText, setDisplayedText] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showCursor, setShowCursor] = useState<boolean>(true);
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [myGamesCount, setMyGamesCount] = useState<number>(0);
  const [loadingDashboard, setLoadingDashboard] = useState<boolean>(false);

  // Box fly in animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setBoxFlewIn(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (boxFlewIn && currentIndex < welcomeText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + welcomeText[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 80);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, welcomeText, boxFlewIn]);

  // Cursor blink
  useEffect(() => {
    if (showWelcomeText) {
      const interval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 530);
      return () => clearInterval(interval);
    }
  }, [showWelcomeText]);

  // Hide welcome text and expand to login form
  useEffect(() => {
    if (currentIndex === welcomeText.length) {
      // Wait 2 seconds, then hide text
      const hideTextTimeout = setTimeout(() => {
        setShowWelcomeText(false);
        // After text fades, expand to login form
        setTimeout(() => {
          setShowLoginForm(true);
        }, 500);
      }, 2000); // Show welcome text for 2 seconds
      return () => clearTimeout(hideTextTimeout);
    }
  }, [currentIndex, welcomeText.length]);

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

  const loadDashboardData = async () => {
    try {
      setLoadingDashboard(true);
      const [dashboardResult, gamesResult] = await Promise.allSettled([
        DashboardService.getTodayDashboard().catch(() => DashboardService.getMockDashboardData()),
        GameService.getMyGames().catch(() => []),
      ]);

      if (dashboardResult.status === "fulfilled") {
        setDashboardData(dashboardResult.value);
      }

      if (gamesResult.status === "fulfilled") {
        setMyGamesCount(gamesResult.value.length);
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      const mockData = DashboardService.getMockDashboardData();
      setDashboardData(mockData);
    } finally {
      setLoadingDashboard(false);
    }
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
        
        // Hide login form
        setShowLoginForm(false);
        
        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          navigate("/");
        }, 100);
      } else {
        setError("Đăng nhập thất bại: Không nhận được token");
      }
    } catch (err: unknown) {
      console.error("Login error:", err);

      // Better error messages based on error type
      let errorMessage =
        "Đăng nhập thất bại. Vui lòng kiểm tra thông tin và thử lại.";

      if (err && typeof err === "object") {
        const errorObj = err as Record<string, unknown>;

        if (
          errorObj.code === "ECONNABORTED" ||
          (typeof errorObj.message === "string" &&
            errorObj.message.includes("timeout"))
        ) {
          errorMessage =
            "Kết nối quá lâu. Vui lòng kiểm tra kết nối mạng và thử lại.";
        } else if (
          errorObj.message === "Network Error" ||
          !("response" in errorObj)
        ) {
          errorMessage =
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.";
        } else if ("response" in errorObj) {
          const response = errorObj.response as { data?: { message?: string } };
          if (response.data?.message) {
            errorMessage = response.data.message;
          }
        } else if (typeof errorObj.message === "string") {
          errorMessage = errorObj.message;
        }
      }

      setError(errorMessage);
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
      const response = await userService.googleLogin({
        idToken: credentialResponse.credential,
      });

      if (response.accessToken) {
        login(response.accessToken, response.refreshToken);
        
        // Hide login form
        setShowLoginForm(false);
        
        // Small delay to ensure state is updated before navigation
        setTimeout(() => {
          navigate("/");
        }, 100);
      } else {
        setError("Đăng nhập Google thất bại: Không nhận được token");
      }
    } catch (err: unknown) {
      console.error("Google login error:", err);

      // Better error messages based on error type
      let errorMessage = "Đăng nhập Google thất bại. Vui lòng thử lại.";

      if (err && typeof err === "object") {
        const errorObj = err as Record<string, unknown>;

        if (
          errorObj.code === "ECONNABORTED" ||
          (typeof errorObj.message === "string" &&
            errorObj.message.includes("timeout"))
        ) {
          errorMessage =
            "Kết nối quá lâu. Vui lòng kiểm tra kết nối mạng và thử lại.";
        } else if (
          errorObj.message === "Network Error" ||
          !("response" in errorObj)
        ) {
          errorMessage =
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.";
        } else if ("response" in errorObj) {
          const response = errorObj.response as { data?: { message?: string } };
          if (response.data?.message) {
            errorMessage = response.data.message;
          }
        } else if (typeof errorObj.message === "string") {
          errorMessage = errorObj.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Đăng nhập Google thất bại. Vui lòng thử lại.");
  };

  const getProgressPercentage = () => {
    if (!dashboardData?.stats) return 0;
    const { level, pointsToNextLevel } = dashboardData.stats;
    const currentLevelPoints = level * 200;
    const nextLevelPoints = (level + 1) * 200;
    const progress = ((nextLevelPoints - pointsToNextLevel) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const formatTime = (timeString: string) => {
    if (!timeString || typeof timeString !== "string") return "N/A";
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return timeString;
      return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return timeString;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Single Box - flies in, shows text, expands to login form, then to dashboard */}
      <div 
        className={`transition-all duration-700 ${
          boxFlewIn ? 'translate-x-0 opacity-100' : '-translate-x-[100vw] opacity-0'
        } ${
          showDashboard 
            ? 'w-full max-w-7xl scale-100' 
            : showLoginForm 
              ? 'max-w-md w-full scale-100' 
              : 'max-w-lg w-full scale-90'
        }`}
      >
        <div className={`bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 transition-all duration-700 overflow-hidden ${
          showDashboard ? 'min-h-[90vh]' : ''
        }`}>
          {/* Welcome Text Section */}
          <div 
            className={`transition-all duration-500 ${
              showWelcomeText ? 'opacity-100 max-h-96 py-12 px-8' : 'opacity-0 max-h-0 py-0 px-8'
            }`}
          >
            <div className="text-center">
              <p className="text-2xl md:text-3xl text-white font-semibold min-h-[60px] flex items-center justify-center">
                {displayedText}
                {currentIndex < welcomeText.length && showWelcomeText && (
                  <span className={`inline-block w-0.5 h-8 bg-indigo-400 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                    |
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Login Form Section */}
          <div 
            className={`transition-all duration-700 ${
              showLoginForm ? 'opacity-100 max-h-[2000px] py-8 px-8' : 'opacity-0 max-h-0 py-0 px-8'
            }`}
          >
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

          {/* Dashboard Section */}
          {showDashboard && (
            <div className={`transition-all duration-700 ${
              showDashboard ? 'opacity-100 max-h-[5000px]' : 'opacity-0 max-h-0'
            }`}>
              {loadingDashboard ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-300">Đang tải dashboard...</p>
                  </div>
                </div>
              ) : dashboardData ? (
                <div className="p-6 space-y-8">
                  {/* Header */}
                  <div className="border-b border-gray-700 pb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-white">
                          Chào mừng trở lại, {user?.fullName || user?.userName || 'User'}!
                        </h1>
                        <p className="text-gray-300 mt-1">
                          Hôm nay là một ngày tuyệt vời để gaming! 🎮
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Hôm nay</div>
                        <div className="text-lg font-semibold text-white">
                          {new Date().toLocaleDateString("vi-VN", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {/* Points Card */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-indigo-100 text-sm font-medium">Tổng điểm</p>
                          <p className="text-3xl font-bold">
                            {typeof dashboardData.stats?.totalPoints === "number"
                              ? dashboardData.stats.totalPoints.toLocaleString()
                              : "0"}
                          </p>
                        </div>
                        <div className="bg-indigo-400 bg-opacity-30 rounded-full p-3">
                          <Star className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span>Cấp độ {dashboardData.stats?.level || 0}</span>
                          <span>{dashboardData.stats?.pointsToNextLevel || 0} điểm đến cấp tiếp theo</span>
                        </div>
                        <div className="mt-2 bg-indigo-400 bg-opacity-30 rounded-full h-2">
                          <div
                            className="bg-white rounded-full h-2 transition-all duration-500"
                            style={{ width: `${getProgressPercentage()}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Quests Card */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-emerald-100 text-sm font-medium">Nhiệm vụ hôm nay</p>
                          <p className="text-3xl font-bold">
                            {dashboardData.stats?.questsCompletedToday || 0}/{dashboardData.stats?.totalQuestsToday || 0}
                          </p>
                        </div>
                        <div className="bg-emerald-400 bg-opacity-30 rounded-full p-3">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm text-emerald-100">
                          {(dashboardData.stats?.totalQuestsToday || 0) - (dashboardData.stats?.questsCompletedToday || 0)} nhiệm vụ còn lại
                        </div>
                      </div>
                    </div>

                    {/* Games Card */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-sm font-medium">Games trong thư viện</p>
                          <p className="text-3xl font-bold">{myGamesCount}</p>
                        </div>
                        <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
                          <Gamepad2 className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm text-green-100">Games đã thêm vào thư viện</div>
                      </div>
                    </div>

                    {/* Friends Card */}
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm font-medium">Bạn bè online</p>
                          <p className="text-3xl font-bold">{dashboardData.stats?.friendsOnline || 0}</p>
                        </div>
                        <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
                          <Users className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm text-purple-100">{dashboardData.stats?.totalFriends || 0} bạn bè tổng cộng</div>
                      </div>
                    </div>

                    {/* Events Card */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm font-medium">Sự kiện hôm nay</p>
                          <p className="text-3xl font-bold">{dashboardData.stats?.eventsToday || 0}</p>
                        </div>
                        <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
                          <Calendar className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm text-orange-100">{dashboardData.stats?.roomsJoined || 0} rooms đã tham gia</div>
                      </div>
                    </div>
                  </div>

                  {/* Quests and Events */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Today's Quests */}
                    <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center">
                          <Trophy className="h-5 w-5 mr-2 text-emerald-500" />
                          Nhiệm vụ hôm nay
                        </h2>
                        <span className="text-sm text-gray-400">
                          {dashboardData.stats?.questsCompletedToday || 0}/{dashboardData.stats?.totalQuestsToday || 0}
                        </span>
                      </div>
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {(dashboardData.todayQuests || []).slice(0, 4).map((quest: TodayQuest, index: number) => (
                          <div
                            key={quest.id || `quest-${index}`}
                            className={`p-4 rounded-lg border-2 ${
                              quest.isCompleted
                                ? "bg-emerald-900/30 border-emerald-500"
                                : "bg-gray-600 border-gray-500"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className="text-2xl mt-1">{quest.icon || "📅"}</div>
                                <div className="flex-1">
                                  <h3 className="text-white font-semibold">{quest.title || "Nhiệm vụ"}</h3>
                                  <p className="text-gray-300 text-sm mt-1">{quest.description || ""}</p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <span className="text-emerald-400 text-sm font-medium">+{quest.points || 0} điểm</span>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4">
                                {quest.isCompleted ? (
                                  <CheckCircle className="h-6 w-6 text-emerald-400" />
                                ) : (
                                  <Circle className="h-6 w-6 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Today's Events */}
                    <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                          Sự kiện hôm nay
                        </h2>
                        <span className="text-sm text-gray-400">
                          {dashboardData.todayEvents?.filter((e: TodayEvent) => e.isRegistered).length || 0}/{dashboardData.todayEvents?.length || 0} đã đăng ký
                        </span>
                      </div>
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                        {(dashboardData.todayEvents || []).slice(0, 2).map((event: TodayEvent, index: number) => (
                          <div
                            key={event.id || `event-${index}`}
                            className="p-4 rounded-lg border-2 bg-gray-600 border-gray-500"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-white font-semibold text-lg">{event.title || "Sự kiện"}</h3>
                                <div className="mt-2 space-y-1 text-sm text-gray-300">
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatTime(event.startTime || "")} - {formatTime(event.endTime || "")}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Users className="h-4 w-4" />
                                    <span>{event.currentParticipants || 0}/{event.maxParticipants || 0} người tham gia</span>
                                  </div>
                                </div>
                                {!event.isRegistered && (
                                  <button className="mt-3 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
                                    Đăng ký
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;