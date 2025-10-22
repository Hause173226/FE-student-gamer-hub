import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Plus, Search, Filter, Crown, Shield, Loader2, Gamepad2, BookOpen, Music, Code, Trophy } from 'lucide-react';
import { Community } from '../types/community';
import { Club } from '../types/club';
import CommunityService from '../services/communityService';
import ClubService from '../services/clubService';
import toast from 'react-hot-toast';

export function CommunityDetail() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  
  const [community, setCommunity] = useState<Community | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateClubModal, setShowCreateClubModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    isPublic: true,
  });

  useEffect(() => {
    loadCommunityAndClubs();
  }, [communityId]);

  const loadCommunityAndClubs = async () => {
    if (!communityId) return;
    
    setLoading(true);
    try {
      // Load community data
      const communityData = await CommunityService.getCommunityById(communityId);
      setCommunity(communityData);
      
      // Load clubs data for this specific community
      const clubsData = await ClubService.getClubsByCommunityId(communityId);
      setClubs(clubsData);
      
      console.log('✅ Loaded community:', communityData);
      console.log('✅ Loaded clubs:', clubsData);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast.error('Không thể tải dữ liệu cộng đồng');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async (clubId: string | number) => {
    try {
      await ClubService.joinClub(clubId.toString()); // Convert to string for API
      setClubs(prev => prev.map(club => 
        club.id === clubId 
          ? { ...club, isJoined: true, membersCount: club.membersCount + 1 }
          : club
      ));
      toast.success('Đã tham gia club!');
    } catch (error) {
      console.error('❌ Error joining club:', error);
      toast.error('Không thể tham gia club');
    }
  };

  const handleCreateClub = async () => {
    if (!createForm.name.trim() || !createForm.description.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!communityId) {
      toast.error('Không tìm thấy community ID');
      return;
    }

    try {
      const newClub = await ClubService.createClub(
        communityId, 
        {
          name: createForm.name,
          description: createForm.description,
          isPublic: createForm.isPublic,
          membersCount: 0
        }
      );

      setClubs(prev => [newClub, ...prev]);
      setCreateForm({ name: '', description: '', isPublic: true });
      setShowCreateClubModal(false);
      toast.success('Tạo club thành công!');
    } catch (error) {
      console.error('❌ Error creating club:', error);
      toast.error('Không thể tạo club mới');
    }
  };

  const getClubColor = (club: Club) => {
    return club.color || 'from-blue-500 to-cyan-600';
  };

  const getCommunityIcon = (category?: string) => {
    switch (category) {
      case 'Gaming': return <Gamepad2 className="w-5 h-5" />;
      case 'Education': return <BookOpen className="w-5 h-5" />;
      case 'Sports': return <Trophy className="w-5 h-5" />;
      case 'Music': return <Music className="w-5 h-5" />;
      case 'Technology': return <Code className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  // Filter clubs based on search
  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         club.description.toLowerCase().includes(searchQuery.toLowerCase());
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
                    <span>{community.category || 'General'}</span>
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
              onClick={() => setShowCreateClubModal(true)}
              className="flex items-center space-x-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Tạo club</span>
            </button>
          </div>
        </div>

        {/* Clubs */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-4">
            Các club trong cộng đồng ({filteredClubs.length})
          </h2>
        </div>

        {filteredClubs.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Chưa có club nào trong cộng đồng này</p>
            <p className="text-gray-500 text-sm mt-2">Hãy là người đầu tiên tạo club!</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClubs.map((club) => (
              <div
                key={club.id}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${getClubColor(club)} rounded-xl flex items-center justify-center`}>
                    <span className="text-2xl">{club.avatar}</span>
                  </div>
                  {club.isJoined ? (
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
                  {club.name}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {club.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{club.membersCount} thành viên</span>
                  </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => club.isJoined ? null : handleJoinClub(club.id)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      club.isJoined
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                    disabled={club.isJoined}
                  >
                    {club.isJoined ? 'Đã tham gia' : 'Tham gia'}
                  </button>
                  {club.isJoined && (
                    <button
                      onClick={() => navigate(`/rooms`)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Vào Rooms
                    </button>
                  )}
                </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Club Modal */}
        {showCreateClubModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Tạo club mới</h3>
                <button
                  onClick={() => setShowCreateClubModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-gray-400">×</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Tên club
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
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
                    value={createForm.description}
                    onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    placeholder="Mô tả về club..."
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={createForm.isPublic}
                      onChange={(e) => setCreateForm({...createForm, isPublic: e.target.checked})}
                      className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-white">Club công khai</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateClubModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateClub}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Tạo club
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}