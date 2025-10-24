import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  LogOut,
  AlertCircle,
  Search,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Video,
  Gamepad2,
  Home,
  BookOpen,
  Trophy,
  Users,
  Smile,
  MessageSquare,
  Calendar,
  User,
} from "lucide-react";
import clsx from "clsx";
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
  onCollapseToggle: () => void;
}

export function Sidebar({
  currentView,
  onViewChange,
  isOpen,
  isCollapsed,
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
  
  // Optimized menu structure - group related items
  const mainMenuItems = [
    { id: "dashboard", label: "Trang chủ", icon: Home },
    { id: "games", label: "Games", icon: Gamepad2 },
    { id: "my-games", label: "My Games", icon: BookOpen },
    { id: "quests", label: "Quests", icon: Trophy },
  ];

  const socialMenuItems = [
    { id: "communities", label: "Cộng đồng", icon: Users },
    { id: "friends", label: "Bạn bè", icon: Smile },
    { id: "rooms", label: "Chat", icon: MessageSquare },
    { id: "events", label: "Sự kiện", icon: Calendar },
  ];

  const [showSocialMenu, setShowSocialMenu] = useState(false);
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

    onViewChange(id);
    navigate(`/${id}`);
  };

  const handleClubClick = (clubId: string) => {
    navigate(`/clubs/${clubId}`);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div className={clsx(
        "fixed left-0 top-0 h-full bg-gray-900 border-r border-gray-700 transition-all duration-300 z-40 flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">GamerHub</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onCollapseToggle}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className={clsx("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} />
            </button>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={clsx(
              "bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center",
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

        {/* Navigation Menu - Grouped Structure */}
        <nav className={clsx("flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 scroll-smooth", isCollapsed ? "p-2" : "p-4")}>
          <ul className="space-y-1">
            {/* Main Menu Items */}
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
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
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                    )}
                  </button>
                </li>
              );
            })}

            {/* Social Menu Group */}
            {!isCollapsed && (
              <li>
                <button
                  onClick={() => setShowSocialMenu(!showSocialMenu)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <Users className="w-5 h-5" />
                  <span className="text-sm font-medium flex-1">Xã hội</span>
                  {showSocialMenu ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                {showSocialMenu && (
                  <div className="ml-6 mt-2 space-y-1">
                    {socialMenuItems.map((item) => {
                      const Icon = item.icon;
                      const isRooms = item.id === 'rooms';
                      
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => handleMenuClick(item.id)}
                            className={clsx(
                              "w-full flex items-center rounded-lg text-left transition-colors",
                              "space-x-3 px-3 py-2",
                              currentView === item.id
                                ? "bg-indigo-600 text-white"
                                : "text-gray-400 hover:bg-gray-700 hover:text-white"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm font-medium flex-1">{item.label}</span>
                            {isRooms && (
                              showClubs ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )
                            )}
                          </button>
                          
                          {/* Clubs list for rooms */}
                          {isRooms && showClubs && (
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
                  </div>
                )}
              </li>
            )}

            {/* Profile */}
            <li>
              <button
                onClick={() => handleMenuClick('profile')}
                className={clsx(
                  "w-full flex items-center rounded-lg text-left transition-colors",
                  isCollapsed ? "justify-center p-3" : "space-x-3 px-3 py-2",
                  currentView === 'profile'
                    ? "bg-indigo-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
                title={isCollapsed ? "Hồ sơ" : undefined}
              >
                <User className={clsx("text-white", isCollapsed ? "w-6 h-6" : "w-5 h-5")} />
                {!isCollapsed && (
                  <span className="text-sm font-medium flex-1">Hồ sơ</span>
                )}
              </button>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          {!isCollapsed ? (
            <div className="space-y-2">
              <button
                onClick={() => setShowMediaTest(true)}
                className="w-full flex items-center space-x-3 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white"
              >
                <Video className="w-4 h-4" />
                <span className="text-sm font-medium">Test Media</span>
              </button>
              
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center space-x-3 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors text-red-400 hover:text-red-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setShowMediaTest(true)}
                className="w-full flex justify-center p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white"
                title="Test Media"
              >
                <Video className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex justify-center p-3 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors text-red-400 hover:text-red-300"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      <MediaTestTool
        isOpen={showMediaTest}
        onClose={() => setShowMediaTest(false)}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Xác nhận đăng xuất</h3>
                <p className="text-sm text-gray-400">Bạn có chắc chắn muốn đăng xuất?</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                disabled={isLoggingOut}
              >
                Hủy
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang đăng xuất...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}