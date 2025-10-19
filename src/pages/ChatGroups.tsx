import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Users, MessageCircle, Loader2 } from 'lucide-react';
import { getJoinedGroups, MockGroup } from '../data/mockData';
import toast from 'react-hot-toast';

export function ChatGroups() {
  const navigate = useNavigate();
  const [joinedGroups, setJoinedGroups] = useState<MockGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJoinedGroups();
  }, []);

  const loadJoinedGroups = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const groups = getJoinedGroups();
      setJoinedGroups(groups);
      console.log('✅ Loaded joined groups:', groups);
    } catch (error) {
      console.error('❌ Error loading joined groups:', error);
      toast.error('Không thể tải danh sách nhóm chat');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupClick = (groupId: number) => {
    navigate(`/chat/${groupId}`);
  };

  const getGroupColor = (index: number) => {
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
          <p className="text-gray-400">Đang tải nhóm chat...</p>
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
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại Trang chủ</span>
          </button>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Phòng Chat
                  </h1>
                  <p className="text-gray-400">Các nhóm chat bạn đã tham gia</p>
                </div>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                <Plus className="w-5 h-5" />
                <span>Tạo nhóm mới</span>
              </button>
            </div>
          </div>
        </div>

        {/* Groups List */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-4">
            Nhóm chat của bạn ({joinedGroups.length})
          </h2>
        </div>

        {joinedGroups.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
            <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Bạn chưa tham gia nhóm chat nào</p>
            <p className="text-gray-500 text-sm mt-2">Hãy tham gia cộng đồng để bắt đầu chat!</p>
            <button
              onClick={() => navigate('/communities')}
              className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Khám phá cộng đồng
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {joinedGroups.map((group, index) => (
              <div
                key={group.id}
                onClick={() => handleGroupClick(group.id)}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${getGroupColor(index)} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                    <span className="text-2xl">{group.avatar}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-sm">Đã tham gia</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  {group.name}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {group.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{group.membersCount} thành viên</span>
                  </div>
                  <div className="text-indigo-400 text-sm font-medium group-hover:text-indigo-300 transition-colors">
                    Vào chat →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



