import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Hash, 
  Lock, 
  Users, 
  Settings, 
  Plus, 
  Search,
  Mic,
  MicOff,
  Headphones,
  HeadphonesOff,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Crown,
  Shield,
  Star,
  MessageSquare,
  Phone,
  Video,
  UserPlus,
  Settings2
} from 'lucide-react';
import { RoomService } from '../services/roomService';
import { ClubService } from '../services/clubService';
import { Room, RoomJoinPolicy } from '../types/room';
import { Club } from '../types/club';
import { toast } from 'react-hot-toast';

export default function ClubDetail() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  
  // State
  const [club, setClub] = useState<Club | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load club and rooms
  useEffect(() => {
    if (clubId) {
      loadClubAndRooms();
    }
  }, [clubId]);

  const loadClubAndRooms = async () => {
    if (!clubId) return;
    
    setLoading(true);
    try {
      // Load club info
      const clubData = await ClubService.getClubById(clubId);
      setClub(clubData);
      
      // Load rooms
      const roomsData = await RoomService.getRoomsByClubId(clubId);
      setRooms(roomsData);
      
      // Select first room by default
      if (roomsData.length > 0) {
        setSelectedRoom(roomsData[0]);
      }
    } catch (error) {
      console.error('❌ Error loading club and rooms:', error);
      toast.error('Không thể tải thông tin club');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleJoinRoom = async (room: Room) => {
    try {
      await RoomService.joinRoom(room.id.toString());
      toast.success(`Đã tham gia ${room.name}`);
      // Refresh rooms
      loadClubAndRooms();
    } catch (error) {
      console.error('❌ Error joining room:', error);
      toast.error('Không thể tham gia room');
    }
  };

  const getRoomIcon = (room: Room) => {
    const nameLower = room.name.toLowerCase();
    if (nameLower.includes('voice') || nameLower.includes('voice-chat')) return <Mic className="w-4 h-4" />;
    if (nameLower.includes('general') || nameLower.includes('chung')) return <Hash className="w-4 h-4" />;
    if (nameLower.includes('announcement') || nameLower.includes('thông báo')) return <MessageSquare className="w-4 h-4" />;
    if (nameLower.includes('coaching') || nameLower.includes('hướng dẫn')) return <Star className="w-4 h-4" />;
    if (nameLower.includes('tournament') || nameLower.includes('giải')) return <Crown className="w-4 h-4" />;
    if (nameLower.includes('strategy') || nameLower.includes('chiến thuật')) return <Shield className="w-4 h-4" />;
    if (nameLower.includes('lfg') || nameLower.includes('tìm nhóm')) return <UserPlus className="w-4 h-4" />;
    if (nameLower.includes('meme') || nameLower.includes('fun')) return <MessageSquare className="w-4 h-4" />;
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

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <p className="text-xs text-gray-400">{club.membersCount} thành viên</p>
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
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-2">
              ROOMS
            </div>
            <div className="space-y-1">
              {filteredRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => handleRoomClick(room)}
                  className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md text-left transition-colors group ${
                    selectedRoom?.id === room.id
                      ? 'bg-gray-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {getRoomIcon(room)}
                    {getJoinPolicyIcon(room.joinPolicy)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{room.name}</div>
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
                </button>
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
                <Headphones className="w-4 h-4" />
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
              </div>
              <div className="flex-1" />
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-700 rounded">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded">
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded">
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Room Description */}
            {selectedRoom.description && (
              <div className="bg-gray-800 border-b border-gray-700 p-3">
                <p className="text-sm text-gray-300">{selectedRoom.description}</p>
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
            <div className="flex-1 bg-gray-900 p-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center text-gray-400 py-8">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Chào mừng đến với {selectedRoom.name}!</h3>
                  <p className="text-sm">
                    {selectedRoom.isMember 
                      ? 'Bạn đã tham gia room này. Hãy bắt đầu trò chuyện!'
                      : 'Bạn cần tham gia room để có thể trò chuyện.'
                    }
                  </p>
                  {!selectedRoom.isMember && (
                    <button
                      onClick={() => handleJoinRoom(selectedRoom)}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
                    >
                      Tham gia room
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Input */}
            {selectedRoom.isMember && (
              <div className="bg-gray-800 border-t border-gray-700 p-4">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder={`Gửi tin nhắn trong ${selectedRoom.name}`}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                      <MessageSquare className="w-5 h-5" />
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
              <h3 className="text-xl font-semibold mb-2">Chọn một room để bắt đầu</h3>
              <p className="text-sm">Chọn room từ danh sách bên trái để bắt đầu trò chuyện</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}