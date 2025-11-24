import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Hash,
  Lock,
  Users,
  Settings,
  Plus,
  Search,
  Mic,
  Crown,
  Shield,
  Star,
  MessageSquare,
  UserPlus,
  X,
} from "lucide-react";
import { RoomService } from "../services/roomService";
import { ClubService } from "../services/clubService";
import { Room, RoomJoinPolicy } from "../types/room";
import { Club } from "../types/club";
import { toast } from "react-hot-toast";
import ChatContainer from "../components/chat/ChatContainer";
import ChatDebug from "../components/chat/ChatDebug";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../contexts/AuthContext";

// Cache keys
const CLUB_DETAIL_CACHE_KEY = "club_detail_cache";
const ROOMS_CACHE_KEY = "rooms_cache";
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export default function ClubDetail() {
  const { clubId } = useParams<{ clubId: string }>();
  const { user } = useAuth();
  const { isConnected } = useChat();

  // State
  const [club, setClub] = useState<Club | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Create room modal state
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [createRoomData, setCreateRoomData] = useState({
    name: "",
    description: "",
    joinPolicy: RoomJoinPolicy.Open,
    password: "",
    capacity: "",
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadClubAndRooms = useCallback(async () => {
    if (!clubId) return;

    setLoading(true);
    try {
      // Try cache first
      const clubCacheKey = `${CLUB_DETAIL_CACHE_KEY}_${clubId}`;
      const roomsCacheKey = `${ROOMS_CACHE_KEY}_${clubId}`;
      const cachedClub = getCachedClub(clubCacheKey);
      const cachedRooms = getCachedRooms(roomsCacheKey);

      if (cachedClub && cachedRooms) {
        setClub(cachedClub);
        setRooms(cachedRooms);
        if (cachedRooms.length > 0) {
          setSelectedRoom(cachedRooms[0]);
        }
        setLoading(false);

        // Refresh in background
        Promise.all([
          ClubService.getClubById(clubId),
          RoomService.getRoomsByClubId(clubId),
        ])
          .then(([clubData, roomsData]) => {
            setClub(clubData);
            setRooms(roomsData);
            if (roomsData.length > 0) {
              setSelectedRoom(roomsData[0]);
            }
            cacheClub(clubCacheKey, clubData);
            cacheRooms(roomsCacheKey, roomsData);
          })
          .catch((err) => {
            console.warn("Background refresh failed:", err);
          });
        return;
      }

      // Load from API
      const [clubData, roomsData] = await Promise.all([
        ClubService.getClubById(clubId),
        RoomService.getRoomsByClubId(clubId),
      ]);

      setClub(clubData);
      setRooms(roomsData);

      // Select first room by default
      if (roomsData.length > 0) {
        setSelectedRoom(roomsData[0]);
      }

      // Cache results
      cacheClub(clubCacheKey, clubData);
      cacheRooms(roomsCacheKey, roomsData);
    } catch (error) {
      console.error("❌ Error loading club and rooms:", error);
      // Try cache on error
      const clubCacheKey = `${CLUB_DETAIL_CACHE_KEY}_${clubId}`;
      const roomsCacheKey = `${ROOMS_CACHE_KEY}_${clubId}`;
      const cachedClub = getCachedClub(clubCacheKey);
      const cachedRooms = getCachedRooms(roomsCacheKey);

      if (cachedClub) setClub(cachedClub);
      if (cachedRooms) {
        setRooms(cachedRooms);
        if (cachedRooms.length > 0) {
          setSelectedRoom(cachedRooms[0]);
        }
      }

      if (!cachedClub || !cachedRooms) {
        toast.error("Không thể tải thông tin club");
      }
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  // Load club and rooms on mount and when clubId changes
  useEffect(() => {
    if (clubId) {
      loadClubAndRooms();
    }
  }, [clubId, loadClubAndRooms]);

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleJoinRoom = useCallback(
    async (room: Room) => {
      // Optimistic update
      setRooms((prev) =>
        prev.map((r) =>
          r.id === room.id
            ? { ...r, isMember: true, membersCount: r.membersCount + 1 }
            : r
        )
      );

      try {
        await RoomService.joinRoom(room.id.toString());
        toast.success(`Đã tham gia ${room.name}`);
        // Refresh in background
        loadClubAndRooms().catch(console.error);
      } catch (error) {
        console.error("❌ Error joining room:", error);
        // Revert on error
        setRooms((prev) =>
          prev.map((r) =>
            r.id === room.id
              ? {
                  ...r,
                  isMember: false,
                  membersCount: Math.max(0, r.membersCount - 1),
                }
              : r
          )
        );
        toast.error("Không thể tham gia room");
      }
    },
    [loadClubAndRooms]
  );

  const handleCreateRoom = useCallback(async () => {
    if (!clubId || !createRoomData.name.trim()) {
      toast.error("Vui lòng nhập tên room");
      return;
    }

    try {
      const roomData = {
        clubId: clubId,
        name: createRoomData.name.trim(),
        description: createRoomData.description.trim() || undefined,
        joinPolicy: createRoomData.joinPolicy,
        password: createRoomData.password.trim() || undefined,
        capacity: createRoomData.capacity
          ? parseInt(createRoomData.capacity)
          : undefined,
      };

      const newRoom = await RoomService.createRoom(roomData);
      toast.success(`Đã tạo room "${createRoomData.name}" thành công`);

      // Optimistic update - add new room to list
      setRooms((prev) => [...prev, newRoom]);
      setSelectedRoom(newRoom);

      // Reset form
      setCreateRoomData({
        name: "",
        description: "",
        joinPolicy: RoomJoinPolicy.Open,
        password: "",
        capacity: "",
      });
      setShowCreateRoomModal(false);

      // Refresh in background to get full data
      loadClubAndRooms().catch(console.error);
    } catch (error) {
      console.error("❌ Error creating room:", error);
      toast.error("Không thể tạo room");
    }
  }, [clubId, createRoomData, loadClubAndRooms]);

  const getRoomIcon = (room: Room) => {
    const nameLower = room.name.toLowerCase();
    if (nameLower.includes("voice") || nameLower.includes("voice-chat"))
      return <Mic className="w-4 h-4" />;
    if (nameLower.includes("general") || nameLower.includes("chung"))
      return <Hash className="w-4 h-4" />;
    if (nameLower.includes("announcement") || nameLower.includes("thông báo"))
      return <MessageSquare className="w-4 h-4" />;
    if (nameLower.includes("coaching") || nameLower.includes("hướng dẫn"))
      return <Star className="w-4 h-4" />;
    if (nameLower.includes("tournament") || nameLower.includes("giải"))
      return <Crown className="w-4 h-4" />;
    if (nameLower.includes("strategy") || nameLower.includes("chiến thuật"))
      return <Shield className="w-4 h-4" />;
    if (nameLower.includes("lfg") || nameLower.includes("tìm nhóm"))
      return <UserPlus className="w-4 h-4" />;
    if (nameLower.includes("meme") || nameLower.includes("fun"))
      return <MessageSquare className="w-4 h-4" />;
    return <Hash className="w-4 h-4" />;
  };

  const getJoinPolicyIcon = (policy: RoomJoinPolicy) => {
    switch (policy) {
      case RoomJoinPolicy.Open:
        return null;
      case RoomJoinPolicy.RequiresApproval:
        return <UserPlus className="w-3 h-3 text-yellow-400" />;
      case RoomJoinPolicy.RequiresPassword:
        return <Lock className="w-3 h-3 text-red-400" />;
      default:
        return null;
    }
  };

  // Memoize filtered rooms
  const filteredRooms = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase();
    return rooms.filter(
      (room) =>
        room.name.toLowerCase().includes(query) ||
        room.description.toLowerCase().includes(query)
    );
  }, [rooms, debouncedSearchQuery]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex h-screen bg-gray-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white">Không tìm thấy club</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Sidebar - Club Info & Rooms */}
      <div className="w-64 bg-gray-800 flex flex-col">
        {/* Club Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">🎮</span>
            </div>
            <div>
              <h1 className="font-semibold text-lg truncate">{club.name}</h1>
              <p className="text-xs text-gray-400">
                {club.membersCount} thành viên
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Rooms List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                ROOMS
              </div>
              {/* Show create room button only for owner */}
              {club?.isOwner && (
                <button
                  onClick={() => setShowCreateRoomModal(true)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  title="Tạo room mới"
                >
                  <Plus className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              )}
            </div>
            <div className="space-y-1">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md text-left transition-colors group ${
                    selectedRoom?.id === room.id
                      ? "bg-gray-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <button
                    onClick={() => handleRoomClick(room)}
                    className="flex items-center space-x-2 flex-1 min-w-0"
                  >
                    <div className="flex items-center space-x-2">
                      {getRoomIcon(room)}
                      {getJoinPolicyIcon(room.joinPolicy)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {room.name}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center space-x-2">
                        <Users className="w-3 h-3" />
                        <span>{room.membersCount}</span>
                        {room.capacity && (
                          <>
                            <span>/</span>
                            <span>{room.capacity}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                  {!room.isMember && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinRoom(room);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-600 rounded"
                    >
                      <UserPlus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">User Name</div>
              <div className="text-xs text-gray-400">Online</div>
            </div>
            <div className="flex space-x-1">
              <button className="p-1 hover:bg-gray-700 rounded">
                <Mic className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-gray-700 rounded">
                <Mic className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-gray-700 rounded">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Room Chat */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Room Header */}
            <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4">
              <div className="flex items-center space-x-3">
                {getRoomIcon(selectedRoom)}
                <h2 className="font-semibold">{selectedRoom.name}</h2>
                {getJoinPolicyIcon(selectedRoom.joinPolicy)}
                {isConnected && (
                  <div
                    className="w-2 h-2 bg-green-500 rounded-full"
                    title="Connected to chat"
                  />
                )}
              </div>
              <div className="flex-1" />
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-700 rounded">
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded">
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Room Description */}
            {selectedRoom.description && (
              <div className="bg-gray-800 border-b border-gray-700 p-3">
                <p className="text-sm text-gray-300">
                  {selectedRoom.description}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{selectedRoom.membersCount} thành viên</span>
                  </div>
                  {selectedRoom.capacity && (
                    <div className="flex items-center space-x-1">
                      <span>Sức chứa: {selectedRoom.capacity}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <span>Tạo: {selectedRoom.createdAt}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Area */}
            {selectedRoom.isMember ? (
              <ChatContainer
                roomId={selectedRoom.id.toString()}
                currentUserId={user?.id?.toString()}
                className="flex-1"
              />
            ) : (
              <div className="flex-1 bg-gray-900 p-4">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center text-gray-400 py-8">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">
                      Chào mừng đến với {selectedRoom.name}!
                    </h3>
                    <p className="text-sm mb-4">
                      Bạn cần tham gia room để có thể trò chuyện.
                    </p>
                    <button
                      onClick={() => handleJoinRoom(selectedRoom)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
                    >
                      Tham gia room
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-900">
            <div className="text-center text-gray-400">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">
                Chọn một room để bắt đầu
              </h3>
              <p className="text-sm">
                Chọn room từ danh sách bên trái để bắt đầu trò chuyện
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Tạo Room Mới</h3>
              <button
                onClick={() => setShowCreateRoomModal(false)}
                className="p-1 hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Room Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tên Room *
                </label>
                <input
                  type="text"
                  value={createRoomData.name}
                  onChange={(e) =>
                    setCreateRoomData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Nhập tên room..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={createRoomData.description}
                  onChange={(e) =>
                    setCreateRoomData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Mô tả về room..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Join Policy */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chính sách tham gia
                </label>
                <select
                  value={createRoomData.joinPolicy}
                  onChange={(e) =>
                    setCreateRoomData((prev) => ({
                      ...prev,
                      joinPolicy: e.target.value as RoomJoinPolicy,
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={RoomJoinPolicy.Open}>
                    Mở - Ai cũng có thể tham gia
                  </option>
                  <option value={RoomJoinPolicy.RequiresApproval}>
                    Yêu cầu phê duyệt
                  </option>
                  <option value={RoomJoinPolicy.RequiresPassword}>
                    Bảo vệ bằng mật khẩu
                  </option>
                </select>
              </div>

              {/* Password (if password protected) */}
              {createRoomData.joinPolicy ===
                RoomJoinPolicy.RequiresPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mật khẩu *
                  </label>
                  <input
                    type="password"
                    value={createRoomData.password}
                    onChange={(e) =>
                      setCreateRoomData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Nhập mật khẩu..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sức chứa (tùy chọn)
                </label>
                <input
                  type="number"
                  value={createRoomData.capacity}
                  onChange={(e) =>
                    setCreateRoomData((prev) => ({
                      ...prev,
                      capacity: e.target.value,
                    }))
                  }
                  placeholder="Số lượng thành viên tối đa..."
                  min="1"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateRoomModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateRoom}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Tạo Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel - Remove in production */}
      <ChatDebug />
    </div>
  );
}

// Cache helper functions
function getCachedClub(key: string): Club | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const now = Date.now();

    if (now - data.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key);
      return null;
    }

    return data.club;
  } catch (error) {
    console.error("Error reading club cache:", error);
    return null;
  }
}

function cacheClub(key: string, club: Club) {
  try {
    const cache = {
      club,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cache));
  } catch (error) {
    console.error("Error caching club:", error);
  }
}

function getCachedRooms(key: string): Room[] | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const now = Date.now();

    if (now - data.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key);
      return null;
    }

    return data.rooms;
  } catch (error) {
    console.error("Error reading rooms cache:", error);
    return null;
  }
}

function cacheRooms(key: string, rooms: Room[]) {
  try {
    const cache = {
      rooms,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cache));
  } catch (error) {
    console.error("Error caching rooms:", error);
  }
}
