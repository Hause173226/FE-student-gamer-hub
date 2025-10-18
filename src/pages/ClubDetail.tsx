import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Hash, Volume2, Lock, Globe, Loader2, MessageSquare } from 'lucide-react';
import { clubService, roomService, Club, Room } from '../services/platformGameService';
import toast from 'react-hot-toast';

export function ClubDetail() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  
  const [club, setClub] = useState<Club | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClubAndRooms();
  }, [clubId]);

  const loadClubAndRooms = async () => {
    if (!clubId) return;
    
    setLoading(true);
    try {
      const [clubData, roomsData] = await Promise.all([
        clubService.getById(Number(clubId)),
        roomService.getByClubId(Number(clubId))
      ]);
      
      setClub(clubData);
      setRooms(roomsData);
      console.log('✅ Loaded club:', clubData);
      console.log('✅ Loaded rooms:', roomsData);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast.error('Không thể tải dữ liệu club');
    } finally {
      setLoading(false);
    }
  };

  const getRoomIcon = (name: string) => {
    if (name.toLowerCase().includes('voice') || name.toLowerCase().includes('voice')) {
      return <Volume2 className="w-5 h-5" />;
    }
    return <Hash className="w-5 h-5" />;
  };

  const getRoomColor = (index: number) => {
    const colors = [
      'from-blue-500 to-cyan-600',
      'from-purple-500 to-pink-600',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-indigo-500 to-blue-600',
      'from-rose-500 to-pink-600',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Đang tải club...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Không tìm thấy club</p>
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/communities/${club.communityId}`)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại Cộng đồng</span>
          </button>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {club.name.substring(0, 3).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {club.name}
                  </h1>
                  {club.description && (
                    <p className="text-gray-400 mb-3">{club.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{club.membersCount.toLocaleString()} thành viên</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {club.isPublic ? (
                        <>
                          <Globe className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">Công khai</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400">Riêng tư</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-4">
            Các phòng chat ({rooms.length})
          </h2>
        </div>

        {rooms.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
            <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Chưa có phòng chat nào trong club này</p>
            <p className="text-gray-500 text-sm mt-2">Hãy là người đầu tiên tạo phòng!</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {rooms.map((room, index) => (
              <div
                key={room.id}
                onClick={() => navigate(`/rooms/${room.id}`)}
                className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-indigo-500 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-r ${getRoomColor(index)} rounded-lg flex items-center justify-center`}>
                    {getRoomIcon(room.name)}
                  </div>
                  <div className="text-gray-400 group-hover:text-indigo-400 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
                  {getRoomIcon(room.name)}
                  <span>{room.name}</span>
                </h3>

                {room.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {room.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1 text-emerald-400">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span>{room.membersCount} online</span>
                    </div>
                    {room.capacity && (
                      <div className="text-gray-500">
                        /{room.capacity} max
                      </div>
                    )}
                  </div>
                  <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                    Vào chat →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {rooms.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Tổng phòng</div>
              <div className="text-2xl font-bold text-white">{rooms.length}</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Online</div>
              <div className="text-2xl font-bold text-emerald-400">
                {rooms.reduce((sum, r) => sum + r.membersCount, 0)}
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Capacity</div>
              <div className="text-2xl font-bold text-gray-400">
                {rooms.reduce((sum, r) => sum + (r.capacity || 0), 0) || '∞'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


