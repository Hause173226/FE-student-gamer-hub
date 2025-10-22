import { useState } from "react";
import {
  Trophy,
  Star,
  Settings,
  LogOut,
  X,
  AlertCircle,
  Search,
} from "lucide-react";
import clsx from "clsx";
import { MENU_ITEMS } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import { GlobalSearchModal } from "./GlobalSearchModal";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  currentView,onViewChange = () => {},
  isOpen,
  onToggle,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      await logout();
      // AuthContext sẽ tự động redirect về /login
    } catch (error) {
      console.error("Logout error:", error);
      // Có thể thêm toast notification ở đây
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 border-r border-gray-700 transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">SGH</h1>
              <p className="text-xs text-gray-400">Student Gamer Hub</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.FullName?.charAt(0)?.toUpperCase() ||
                  user?.UserName?.charAt(0)?.toUpperCase() ||
                  "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-white truncate">
                {user?.FullName || user?.UserName || "User"}
              </h3>
              <p className="text-xs text-gray-400 truncate">
                {user?.University || user?.Email || "Student"}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs text-yellow-400">
                  Level {user?.Level || 1}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Search */}
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={() => setShowSearchModal(true)}
            className="w-full flex items-center space-x-3 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors group"
          >
            <Search className="w-4 h-4 text-gray-400 group-hover:text-indigo-400 transition-colors" />
            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              Tìm kiếm bạn bè...
            </span>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      onViewChange(item.id);
                      if (isOpen) {
                        onToggle();
                      }
                    }}
                    className={clsx(
                      "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                      currentView === item.id
                        ? "bg-indigo-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={() => {
                onViewChange("settings");
                if (isOpen) {
                  onToggle();
                }
              }}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Cài đặt</span>
            </button>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center justify-center px-3 py-2 text-gray-300 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Global Search Modal */}
      {showSearchModal && (
        <GlobalSearchModal onClose={() => setShowSearchModal(false)} />
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white text-center mb-2">
              Xác nhận đăng xuất
            </h3>

            {/* Message */}
            <p className="text-slate-400 text-center mb-6">
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
            </p>

            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoggingOut && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
