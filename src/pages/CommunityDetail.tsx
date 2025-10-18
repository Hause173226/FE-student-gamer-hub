import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Plus, Search, Filter, Crown, Shield, Loader2, Gamepad2, BookOpen, Music, Code, Trophy } from 'lucide-react';
import { getCommunities, getGroupsByCommunityId, joinGroup, leaveGroup, MockCommunity, MockGroup } from '../data/mockData';
import toast from 'react-hot-toast';

export function CommunityDetail() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  
  const [community, setCommunity] = useState<MockCommunity | null>(null);
  const [groups, setGroups] = useState<MockGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  useEffect(() => {
    loadCommunityAndGroups();
  }, [communityId]);

  const loadCommunityAndGroups = async () => {
    if (!communityId) return;
    
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const communityData = getCommunities().find(c => c.id === Number(communityId));
      const groupsData = getGroupsByCommunityId(Number(communityId));
      
      setCommunity(communityData || null);
      setGroups(groupsData);
      console.log('✅ Loaded community:', communityData);
      console.log('✅ Loaded groups:', groupsData);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast.error('Không thể tải dữ liệu cộng đồng');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = (groupId: number) => {
    joinGroup(groupId);
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isJoined: true, membersCount: group.membersCount + 1 }
        : group
    ));
    toast.success('Đã tham gia nhóm!');
  };

  const handleLeaveGroup = (groupId: number) => {
    leaveGroup(groupId);
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isJoined: false, membersCount: group.membersCount - 1 }
        : group
    ));
    toast.success('Đã rời khỏi nhóm!');
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

  const getCommunityIcon = (category: string) => {
    switch (category) {
      case 'Gaming': return <Gamepad2 className="w-5 h-5" />;
      case 'Education': return <BookOpen className="w-5 h-5" />;
      case 'Sports': return <Trophy className="w-5 h-5" />;
      case 'Music': return <Music className="w-5 h-5" />;
      case 'Technology': return <Code className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  // Filter groups based on search
  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Đang tải cộng đồng...</p>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Không tìm thấy cộng đồng</p>
          <button
            onClick={() => navigate('/communities')}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Quay lại danh sách
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
            onClick={() => navigate('/communities')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại Cộng đồng</span>
          </button>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">{community.avatar}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {community.name}
                  </h1>
                  <p className="text-gray-400 mb-3">{community.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-400">
                      {getCommunityIcon(community.category)}
                      <span>{community.category}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{community.membersCount.toLocaleString()} thành viên</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {community.isPublic ? (
                        <>
                          <Crown className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">Công khai</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 text-yellow-400" />
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

        {/* Search and Actions */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhóm theo tên, mô tả..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
              <Filter className="w-5 h-5" />
              <span>Bộ lọc</span>
            </button>
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="flex items-center space-x-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Tạo nhóm</span>
            </button>
          </div>
        </div>

        {/* Groups */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-4">
            Các nhóm trong cộng đồng ({filteredGroups.length})
          </h2>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Chưa có nhóm nào trong cộng đồng này</p>
            <p className="text-gray-500 text-sm mt-2">Hãy là người đầu tiên tạo nhóm!</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredGroups.map((group, index) => (
              <div
                key={group.id}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${getGroupColor(index)} rounded-xl flex items-center justify-center`}>
                    <span className="text-2xl">{group.avatar}</span>
                  </div>
                  {group.isJoined ? (
                    <div className="flex items-center space-x-2 text-emerald-400">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-sm">Đã tham gia</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-400">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm">Chưa tham gia</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
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
                <div className="flex space-x-2">
                  <button
                    onClick={() => group.isJoined ? handleLeaveGroup(group.id) : handleJoinGroup(group.id)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      group.isJoined
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {group.isJoined ? 'Rời nhóm' : 'Tham gia'}
                  </button>
                  {group.isJoined && (
                    <button
                      onClick={() => navigate(`/chat/${group.id}`)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Vào Chat
                    </button>
                  )}
                </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateGroupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Tạo nhóm mới</h3>
                <button
                  onClick={() => setShowCreateGroupModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-gray-400">×</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Tên nhóm
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Valorant Team 3"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Mô tả
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Mô tả về nhóm..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateGroupModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    toast.success('Nhóm đã được tạo!');
                    setShowCreateGroupModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Tạo nhóm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}