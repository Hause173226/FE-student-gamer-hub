import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Star,
  Settings,
  LogOut,
  X,
  AlertCircle,
  Search,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Video,
} from "lucide-react";
import clsx from "clsx";
import { MENU_ITEMS } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { MembershipService } from "../services/membershipService";
import { SidebarClub } from "../types/membership";
import MediaTestTool from "./MediaTestTool";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  onCollapseToggle: () => void;
}

export function Sidebar({
  currentView,
  onViewChange,
  isOpen,
  isCollapsed,
  onToggle,
  onCollapseToggle,
}: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Debug user data
  useEffect(() => {
    if (user) {
      console.log('👤 Sidebar User Data:', user);
      console.log('📧 User Email:', user.email);
      console.log('👤 User Name:', user.fullName || user.userName);
      console.log('🏫 University:', user.university);
      console.log('⭐ Level:', user.level);
    }
  }, [user]);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showMediaTest, setShowMediaTest] = useState<boolean>(false);
  
  // Clubs state
  const [clubs, setClubs] = useState<SidebarClub[]>([]);
  const [loadingClubs, setLoadingClubs] = useState<boolean>(false);
  const [showClubs, setShowClubs] = useState<boolean>(false);

  // Load clubs from API
  const loadClubs = async () => {
    if (loadingClubs) return;
    
    setLoadingClubs(true);
    try {
      const clubsData = await MembershipService.getMembershipTree();
      setClubs(clubsData);
    } catch (error) {
      console.error('❌ Error loading clubs:', error);
      setClubs([]);
    } finally {
      setLoadingClubs(false);
    }
  };

  const handleMenuClick = (id: string) => {
    // Special handling for rooms (Phòng chat)
    if (id === 'rooms') {
      if (!showClubs) {
        loadClubs();
        setShowClubs(true);
      } else {
        setShowClubs(false);
      }
      return;
    }
    
    // Special handling for chat-groups
    if (id === 'chat-groups') {
      navigate('/chat-groups');
    } else {
      navigate(`/${id}`);
    }
    onViewChange(id);
    if (isOpen) {
      onToggle();
    }
  };

  const handleClubClick = (clubId: string) => {
    navigate(`/clubs/${clubId}`);
    if (isOpen) {
      onToggle();
    }
  };

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
          "fixed inset-y-0 left-0 z-40 bg-gray-800 border-r border-gray-700 transform transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className={clsx("border-b border-gray-700", isCollapsed ? "p-3" : "p-4")}>
          {isCollapsed ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center w-8 h-8">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <button
                onClick={onCollapseToggle}
                className="hidden lg:block p-1 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="Mở rộng sidebar"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center w-8 h-8">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">SGH</h1>
                  <p className="text-xs text-gray-400">Student Gamer Hub</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={onCollapseToggle}
                  className="hidden lg:block p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  aria-label="Thu gọn sidebar"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={onToggle}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  aria-label="Đóng menu"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Card */}
        <div className={clsx("border-b border-gray-700", isCollapsed ? "p-3" : "p-4")}>
          <div className={clsx("flex items-center", isCollapsed ? "justify-center" : "space-x-3")}>
            <div className={clsx("bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center",
              isCollapsed ? "w-8 h-8" : "w-10 h-10"
            )}>
              <span className={clsx("font-bold text-white", isCollapsed ? "text-xs" : "text-sm")}>
                {user?.fullName?.charAt(0)?.toUpperCase() ||
                  user?.userName?.charAt(0)?.toUpperCase() ||
                  user?.email?.charAt(0)?.toUpperCase() ||
                  "U"}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white truncate">
                  {user?.fullName || user?.userName || user?.email || "User"}
                </h3>
                <p className="text-xs text-gray-400 truncate">
                  {user?.university || user?.email || "Student"}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-yellow-400">
                    Level {user?.level || 1}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Search */}
        {!isCollapsed && (
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
        )}

        {/* Navigation Menu */}
        <nav className={clsx("flex-1 overflow-y-auto", isCollapsed ? "p-2" : "p-4")}>
          <ul className="space-y-2">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isRooms = item.id === 'rooms';
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item.id)}
                    className={clsx(
                      "w-full flex items-center rounded-lg text-left transition-colors",
                      isCollapsed ? "justify-center p-3" : "space-x-3 px-3 py-2",
                      currentView === item.id
                        ? "bg-indigo-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={clsx("text-white", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                    {!isCollapsed && (
                      <>
                        <span className="text-sm font-medium flex-1">{item.label}</span>
                        {isRooms && (
                          showClubs ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )
                        )}
                      </>
                    )}
                  </button>
                  
                  {/* Clubs list for rooms */}
                  {isRooms && showClubs && !isCollapsed && (
                    <div className="ml-6 mt-2 space-y-1">
                      {loadingClubs ? (
                        <div className="text-xs text-gray-400 px-3 py-2">
                          Đang tải clubs...
                        </div>
                      ) : clubs.length > 0 ? (
                        clubs.map((club) => (
                          <button
                            key={club.id}
                            onClick={() => handleClubClick(club.id)}
                            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors text-gray-400 hover:bg-gray-700 hover:text-white"
                          >
                            <span className="text-lg">{club.avatar}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {club.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {club.roomsCount} phòng
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-xs text-gray-400 px-3 py-2">
                          Chưa tham gia club nào
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className={clsx("border-t border-gray-700", isCollapsed ? "p-2" : "p-4")}>
          <div className={clsx("flex", isCollapsed ? "flex-col space-y-2" : "space-x-2")}>
            <button
              onClick={() => {
                onViewChange("settings");
                if (isOpen) {
                  onToggle();
                }
              }}
              className={clsx(
                "flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors",
                isCollapsed ? "p-3" : "flex-1 space-x-2 px-3 py-2"
              )}
              title={isCollapsed ? "Cài đặt" : undefined}
            >
              <Settings className={clsx("text-white", isCollapsed ? "w-6 h-6" : "w-4 h-4")} />
              {!isCollapsed && <span className="text-sm">Cài đặt</span>}
            </button>
            <button
              onClick={() => setShowMediaTest(true)}
              className={clsx(
                "flex items-center justify-center text-gray-300 hover:text-purple-400 hover:bg-gray-700 rounded-lg transition-colors",
                isCollapsed ? "p-3" : "px-3 py-2"
              )}
              title={isCollapsed ? "Test Media" : undefined}
              aria-label="Test Media"
            >
              <Video className={clsx("text-white", isCollapsed ? "w-6 h-6" : "w-4 h-4")} />
              {!isCollapsed && <span className="text-sm">Test Media</span>}
            </button>
            <button
              onClick={() => setShowLogoutModal(true)}
              className={clsx(
                "flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors",
                isCollapsed ? "p-3" : "px-3 py-2"
              )}
              title={isCollapsed ? "Đăng xuất" : undefined}
              aria-label="Đăng xuất"
            >
              <LogOut className={clsx("text-white", isCollapsed ? "w-6 h-6" : "w-4 h-4")} />
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

      {/* Media Test Tool Modal */}
      {showMediaTest && (
        <MediaTestTool isOpen={showMediaTest} onClose={() => setShowMediaTest(false)} />
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
