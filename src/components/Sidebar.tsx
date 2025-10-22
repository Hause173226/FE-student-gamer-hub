import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Star,
  Settings,
  LogOut,
  X,
  AlertCircle,
  Search,
  Video,
  Mic,
  Monitor,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import clsx from "clsx";
import { MENU_ITEMS } from "../constants";
import { useAuth } from "../contexts/AuthContext";
import { GlobalSearchModal } from "./GlobalSearchModal";
import { VideoCall } from "./VideoCall";
import { MembershipService } from "../services/membershipService";
import { SidebarClub } from "../types/membership";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  currentView,
  onViewChange,
  isOpen,
  onToggle,
}: SidebarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
  const [showVideoCall, setShowVideoCall] = useState<boolean>(false);
  
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

  // Test functions
  const testCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;
      video.style.width = '300px';
      video.style.height = '200px';
      video.style.border = '2px solid green';
      video.style.position = 'fixed';
      video.style.top = '80px';
      video.style.left = '20px';
      video.style.zIndex = '9999';
      video.style.backgroundColor = 'black';
      video.style.borderRadius = '8px';
      
      const label = document.createElement('div');
      label.textContent = 'Test Camera - Click to close';
      label.style.position = 'absolute';
      label.style.top = '5px';
      label.style.left = '5px';
      label.style.background = 'rgba(0, 0, 0, 0.7)';
      label.style.color = 'white';
      label.style.padding = '2px 6px';
      label.style.borderRadius = '4px';
      label.style.fontSize = '12px';
      label.style.fontWeight = 'bold';
      label.style.cursor = 'pointer';
      
      video.appendChild(label);
      document.body.appendChild(video);
      
      const closeTest = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(video);
      };
      
      label.onclick = closeTest;
      video.onclick = closeTest;
    } catch (error) {
      console.error('Camera test error:', error);
      alert('Không thể truy cập camera: ' + error);
    }
  };

  const testMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      microphone.connect(analyser);
      analyser.fftSize = 256;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const indicator = document.createElement('div');
      indicator.style.position = 'fixed';
      indicator.style.top = '50%';
      indicator.style.left = '50%';
      indicator.style.transform = 'translate(-50%, -50%)';
      indicator.style.zIndex = '9999';
      indicator.style.background = 'rgba(0, 0, 0, 0.8)';
      indicator.style.color = 'white';
      indicator.style.padding = '20px';
      indicator.style.borderRadius = '8px';
      indicator.style.textAlign = 'center';
      indicator.innerHTML = `
        <div style="font-size: 18px; margin-bottom: 10px;">🎤 Test Microphone</div>
        <div id="mic-level" style="font-size: 24px; color: #10b981;">●</div>
        <div style="font-size: 14px; margin-top: 10px;">Click to close</div>
      `;
      
      document.body.appendChild(indicator);
      
      const detectAudio = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        
        const levelEl = document.getElementById('mic-level');
        if (levelEl) {
          if (average > 30) {
            levelEl.style.color = '#ef4444';
            levelEl.textContent = '🔴 SPEAKING';
          } else {
            levelEl.style.color = '#10b981';
            levelEl.textContent = '● Listening';
          }
        }
        
        requestAnimationFrame(detectAudio);
      };
      
      detectAudio();
      
      const closeTest = () => {
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
        document.body.removeChild(indicator);
      };
      
      indicator.onclick = closeTest;
    } catch (error) {
      console.error('Mic test error:', error);
      alert('Không thể truy cập microphone: ' + error);
    }
  };

  const testScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { mediaSource: 'screen' } 
      } as any);
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;
      video.style.width = '80vw';
      video.style.height = '80vh';
      video.style.border = '2px solid blue';
      video.style.position = 'fixed';
      video.style.top = '50%';
      video.style.left = '50%';
      video.style.transform = 'translate(-50%, -50%)';
      video.style.zIndex = '9999';
      video.style.backgroundColor = 'black';
      video.style.borderRadius = '8px';
      
      const label = document.createElement('div');
      label.textContent = 'Test Screen Share - Click to close';
      label.style.position = 'absolute';
      label.style.top = '10px';
      label.style.left = '10px';
      label.style.background = 'rgba(0, 0, 0, 0.8)';
      label.style.color = 'white';
      label.style.padding = '8px 12px';
      label.style.borderRadius = '4px';
      label.style.fontSize = '14px';
      label.style.fontWeight = 'bold';
      label.style.cursor = 'pointer';
      
      video.appendChild(label);
      document.body.appendChild(video);
      
      const closeTest = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(video);
      };
      
      label.onclick = closeTest;
      video.onclick = closeTest;
    } catch (error) {
      console.error('Screen share test error:', error);
      alert('Không thể chia sẻ màn hình: ' + error);
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
              const isRooms = item.id === 'rooms';
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item.id)}
                    className={clsx(
                      "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                      currentView === item.id
                        ? "bg-indigo-600 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    )}
                  >
                    <Icon className="w-5 h-5" />
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
          </ul>

          {/* Test Section */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="text-xs text-gray-400 mb-3 px-3">🧪 Test Tools</div>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={testCamera}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <Video className="w-5 h-5" />
                  <span className="text-sm font-medium">Test Camera</span>
                </button>
              </li>
              <li>
                <button
                  onClick={testMic}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <Mic className="w-5 h-5" />
                  <span className="text-sm font-medium">Test Mic</span>
                </button>
              </li>
              <li>
                <button
                  onClick={testScreenShare}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <Monitor className="w-5 h-5" />
                  <span className="text-sm font-medium">Test Screen Share</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowVideoCall(true)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <Video className="w-5 h-5" />
                  <span className="text-sm font-medium">Test Video Call</span>
                </button>
              </li>
            </ul>
          </div>
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

      {/* Video Call Test Modal */}
      {showVideoCall && (
        <VideoCall
          roomId="test-room"
          userId={user?.UserName || "test-user"}
          onEndCall={() => setShowVideoCall(false)}
        />
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
