import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Users,
  MapPin,
  Filter,
  Lock,
  Globe,
  Loader2,
  Gamepad2,
  BookOpen,
  Music,
  Code,
  Trophy,
} from "lucide-react";
import { getCommunities, MockCommunity } from "../data/mockData";
import toast from "react-hot-toast";

export function Communities() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("discover");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    memberCount: "",
    privacy: "",
  });

  // Mock Data
  const [communities, setCommunities] = useState<MockCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Load communities from mock data
  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = getCommunities();
      setCommunities(data);
      console.log('✅ Loaded communities:', data);
      toast.success(`Đã tải ${data.length} cộng đồng`);
    } catch (error) {
      console.error('❌ Error loading communities:', error);
      toast.error('Không thể tải danh sách cộng đồng');
    } finally {
      setLoading(false);
    }
  };

  // Filter communities based on search
  const filteredCommunities = communities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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

  const getCommunityColor = (index: number) => {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-cyan-500 to-blue-600',
    ];
    return colors[index % colors.length];
  };

  const tabs = [
    { id: "discover", label: "Khám phá", count: null },
    { id: "popular", label: "Phổ biến", count: null },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          Cộng đồng sinh viên 🎓
        </h1>
        <p className="text-gray-400">
          Kết nối với bạn bè trong trường và cả nước
        </p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm cộng đồng theo tên, danh mục..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilterModal(true)}
            className="relative flex items-center space-x-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Bộ lọc</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Tạo cộng đồng</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab.id
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count && (
              <span className="bg-gray-600 text-xs px-2 py-1 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {selectedTab === "discover" && (
        <>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Đang tải cộng đồng...</p>
              </div>
            </div>
          ) : filteredCommunities.length === 0 ? (
            <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
              <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Không tìm thấy cộng đồng nào</p>
              <p className="text-gray-500 text-sm mt-2">Thử tìm kiếm với từ khóa khác</p>
                </div>
          ) : (
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCommunities.map((community, index) => (
                <div
                  key={community.id}
                  onClick={() => navigate(`/communities/${community.id}`)}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-all cursor-pointer transform hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${getCommunityColor(index)} rounded-xl flex items-center justify-center`}>
                      <span className="text-2xl">{community.avatar}</span>
                    </div>
                    {community.isPublic ? (
                      <Globe className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-yellow-400" />
                    )}
              </div>

                  <h3 className="text-lg font-bold text-white mb-2">
                    {community.name}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {community.description}
                  </p>

                  <div className="flex items-center space-x-2 mb-4">
                    {getCommunityIcon(community.category)}
                    <span className="text-sm text-gray-400">{community.category}</span>
              </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2 text-gray-400 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{community.membersCount.toLocaleString()} thành viên</span>
                </div>
                    {community.school && (
                      <div className="flex items-center space-x-1 text-gray-500 text-xs">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[100px]">{community.school}</span>
                </div>
                    )}
              </div>

                  <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                    Xem chi tiết →
                  </button>
                </div>
              ))}
                      </div>
          )}
        </>
      )}

      {selectedTab === "popular" && (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCommunities
            .sort((a, b) => b.membersCount - a.membersCount)
            .slice(0, 6)
            .map((community, index) => (
              <div
                key={community.id}
                onClick={() => navigate(`/communities/${community.id}`)}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-indigo-500 transition-all cursor-pointer transform hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${getCommunityColor(index)} rounded-xl flex items-center justify-center`}>
                    <span className="text-2xl">{community.avatar}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-medium">Popular</span>
                </div>
              </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  {community.name}
                </h3>
                
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {community.description}
                </p>

                <div className="flex items-center space-x-2 mb-4">
                  {getCommunityIcon(community.category)}
                  <span className="text-sm text-gray-400">{community.category}</span>
              </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex items-center space-x-2 text-gray-400 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{community.membersCount.toLocaleString()} thành viên</span>
                </div>
                  {community.school && (
                    <div className="flex items-center space-x-1 text-gray-500 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{community.school}</span>
                </div>
                  )}
              </div>

                <button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                  Xem chi tiết →
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Bộ lọc</h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                <span className="text-gray-400">×</span>
                </button>
              </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Danh mục
                    </label>
                  <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Tất cả</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Education">Education</option>
                  <option value="Sports">Sports</option>
                  <option value="Music">Music</option>
                  <option value="Technology">Technology</option>
                  </select>
                </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                      Số thành viên
                    </label>
                  <select
                    value={filters.memberCount}
                  onChange={(e) => setFilters({...filters, memberCount: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Tất cả</option>
                  <option value="0-100">0 - 100 thành viên</option>
                  <option value="101-500">101 - 500 thành viên</option>
                  <option value="501-1000">501 - 1000 thành viên</option>
                  <option value="1000+">1000+ thành viên</option>
                  </select>
                </div>
              </div>

            <div className="flex space-x-3 mt-6">
                    <button
                onClick={() => setFilters({category: "", memberCount: "", privacy: ""})}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Xóa bộ lọc
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                Áp dụng
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Tạo cộng đồng mới</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="text-gray-400">×</span>
                  </button>
                </div>
            
            <div className="space-y-4">
                    <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tên cộng đồng
                </label>
                <input
                  type="text"
                  placeholder="VD: Cộng đồng Valorant FPT"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

                    <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Mô tả
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả về cộng đồng..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
          </div>

                    <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Danh mục
                </label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500">
                  <option value="">Chọn danh mục</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Education">Education</option>
                  <option value="Sports">Sports</option>
                  <option value="Music">Music</option>
                  <option value="Technology">Technology</option>
                </select>
                </div>
              </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  toast.success('Cộng đồng đã được tạo!');
                  setShowCreateModal(false);
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Tạo cộng đồng
                  </button>
                </div>
              </div>
        </div>
      )}
    </div>
  );
}
