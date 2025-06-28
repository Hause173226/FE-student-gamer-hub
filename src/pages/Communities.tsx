import { useState } from "react";
import {
  Search,
  Plus,
  Users,
  Crown,
  MessageSquare,
  Star,
  MapPin,
  Shield,
  Verified,
  TrendingUp,
  Filter,
  Lock,
  Globe,
  Upload,
  Image,
  X,
  Clock,
  Gamepad2,
  GraduationCap,
  Sliders,
} from "lucide-react";

// Định nghĩa interface cho filters
interface FiltersType {
  university: string;
  game: string;
  memberCount: string;
  privacy: string;
  activity: string;
  tags: string[];
}

export function Communities() {
  const [selectedTab, setSelectedTab] = useState("my-communities");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FiltersType>({
    university: "",
    game: "",
    memberCount: "",
    privacy: "",
    activity: "",
    tags: [],
  });

  const filterOptions = {
    universities: [
      "FPT University",
      "HCMUT",
      "UEH",
      "HUST",
      "VNU",
      "UIT",
      "RMIT",
      "Khác",
    ],
    games: [
      "League of Legends",
      "Valorant",
      "Dota 2",
      "Mobile Legends",
      "CS:GO",
      "PUBG",
      "Genshin Impact",
      "Liên Quân Mobile",
      "Free Fire",
      "Nhiều game",
    ],
    memberCounts: [
      { value: "0-50", label: "0 - 50 thành viên" },
      { value: "51-200", label: "51 - 200 thành viên" },
      { value: "201-500", label: "201 - 500 thành viên" },
      { value: "501-1000", label: "501 - 1000 thành viên" },
      { value: "1000+", label: "1000+ thành viên" },
    ],
    privacyTypes: [
      { value: "public", label: "Công khai", icon: Globe },
      { value: "private", label: "Riêng tư", icon: Lock },
    ],
    activityLevels: [
      {
        value: "very-active",
        label: "Rất hoạt động",
        desc: "Tin nhắn mỗi giờ",
      },
      { value: "active", label: "Hoạt động", desc: "Tin nhắn hàng ngày" },
      { value: "moderate", label: "Vừa phải", desc: "Tin nhắn hàng tuần" },
      { value: "quiet", label: "Ít hoạt động", desc: "Tin nhắn thỉnh thoảng" },
    ],
    popularTags: [
      "Esports",
      "Tournament",
      "Casual",
      "Newbie",
      "Pro",
      "Practice",
      "Ranked",
      "Fun",
      "Competitive",
      "Learning",
      "Coaching",
      "Scrimmage",
    ],
  };

  const handleFilterChange = (category: keyof FiltersType, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters((prev: FiltersType) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const clearFilters = () => {
    setFilters({
      university: "",
      game: "",
      memberCount: "",
      privacy: "",
      activity: "",
      tags: [],
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter((value) =>
      Array.isArray(value) ? value.length > 0 : value !== ""
    ).length;
  };

  const myCommunities = [
    {
      id: 1,
      name: "FPT University - League of Legends",
      members: 1247,
      university: "FPT University",
      verified: true,
      role: "Admin",
      lastActivity: "5 phút trước",
      avatar: "FPT",
      color: "from-blue-500 to-indigo-600",
      unreadMessages: 12,
    },
    {
      id: 2,
      name: "HCMUT Valorant Champions",
      members: 856,
      university: "HCMUT",
      verified: true,
      role: "Member",
      lastActivity: "1 giờ trước",
      avatar: "HCM",
      color: "from-red-500 to-rose-600",
      unreadMessages: 3,
    },
    {
      id: 3,
      name: "UEH Dota 2 Veterans",
      members: 423,
      university: "UEH",
      verified: false,
      role: "Moderator",
      lastActivity: "2 giờ trước",
      avatar: "UEH",
      color: "from-purple-500 to-violet-600",
      unreadMessages: 0,
    },
  ];

  const popularCommunities = [
    {
      id: 4,
      name: "Vietnam Mobile Legends United",
      members: 3420,
      university: "Tất cả trường",
      verified: true,
      description:
        "Cộng đồng Mobile Legends lớn nhất Việt Nam dành cho sinh viên",
      avatar: "VML",
      color: "from-amber-500 to-orange-600",
      trending: true,
    },
    {
      id: 5,
      name: "HCM Gaming Alliance",
      members: 2156,
      university: "Các trường tại HCM",
      verified: true,
      description: "Liên minh game thủ sinh viên khu vực TP.HCM",
      avatar: "HGA",
      color: "from-emerald-500 to-teal-600",
      trending: false,
    },
    {
      id: 6,
      name: "Hanoi Esports Community",
      members: 1890,
      university: "Các trường tại Hà Nội",
      verified: true,
      description: "Cộng đồng esports dành cho sinh viên Hà Nội",
      avatar: "HEC",
      color: "from-indigo-500 to-blue-600",
      trending: true,
    },
  ];

  const tabs = [
    {
      id: "my-communities",
      label: "Cộng đồng của tôi",
      count: myCommunities.length,
    },
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
          Kết nối với game thủ trong trường và cả nước
        </p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm cộng đồng theo tên, trường, game..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilterModal(true)}
            className="relative flex items-center space-x-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Lọc</span>
            {getActiveFilterCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {getActiveFilterCount()}
              </span>
            )}
          </button>
          <button
            onClick={() => setSelectedTab("create-community")}
            className="flex items-center space-x-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
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

      {selectedTab === "create-community" && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Tạo cộng đồng mới
              </h2>
              <button
                onClick={() => setSelectedTab("my-communities")}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form className="space-y-6">
              {/* Community Avatar */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Image className="w-8 h-8 text-white" />
                </div>
                <button
                  type="button"
                  className="flex items-center space-x-2 mx-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Tải ảnh đại diện</span>
                </button>
              </div>

              {/* Community Name */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Tên cộng đồng *
                </label>
                <input
                  type="text"
                  placeholder="VD: FPT University - Valorant Champions"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Mô tả cộng đồng *
                </label>
                <textarea
                  rows={4}
                  placeholder="Mô tả về mục đích, hoạt động của cộng đồng..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* University and Game */}
              <div className="grid lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Trường đại học *
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                    <option value="">Chọn trường</option>
                    <option value="fpt">FPT University</option>
                    <option value="hcmut">HCMUT</option>
                    <option value="ueh">UEH</option>
                    <option value="hust">HUST</option>
                    <option value="vnu">VNU</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Game chính *
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                    <option value="">Chọn game</option>
                    <option value="lol">League of Legends</option>
                    <option value="valorant">Valorant</option>
                    <option value="dota2">Dota 2</option>
                    <option value="mobile-legends">Mobile Legends</option>
                    <option value="csgo">CS:GO</option>
                    <option value="pubg">PUBG</option>
                    <option value="multiple">Nhiều game</option>
                  </select>
                </div>
              </div>

              {/* Privacy Settings */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Quyền riêng tư
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    <input
                      type="radio"
                      name="privacy"
                      value="public"
                      defaultChecked
                      className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="text-white font-medium">
                          Công khai
                        </span>
                        <p className="text-gray-400 text-sm">
                          Ai cũng có thể tìm thấy và tham gia
                        </p>
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                    <input
                      type="radio"
                      name="privacy"
                      value="private"
                      className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                    />
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-yellow-400" />
                      <div>
                        <span className="text-white font-medium">Riêng tư</span>
                        <p className="text-gray-400 text-sm">
                          Chỉ thành viên được mời mới có thể tham gia
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Community Rules */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Quy tắc cộng đồng
                </label>
                <textarea
                  rows={3}
                  placeholder="VD: Không spam, tôn trọng lẫn nhau, không chửi bậy..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Max Members and Tags */}
              <div className="grid lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Số thành viên tối đa
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
                    <option value="50">50 thành viên</option>
                    <option value="100">100 thành viên</option>
                    <option value="250">250 thành viên</option>
                    <option value="500">500 thành viên</option>
                    <option value="1000">1000 thành viên</option>
                    <option value="unlimited">Không giới hạn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Tags (tối đa 5)
                  </label>
                  <input
                    type="text"
                    placeholder="esports, tournament, casual..."
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Ngăn cách bằng dấu phẩy
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedTab("my-communities")}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Tạo cộng đồng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Sliders className="w-6 h-6 text-indigo-400" />
                  <h2 className="text-2xl font-bold text-white">
                    Bộ lọc cộng đồng
                  </h2>
                </div>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* University Filter */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-indigo-400" />
                    <label className="text-sm font-medium text-white">
                      Trường đại học
                    </label>
                  </div>
                  <select
                    value={filters.university}
                    onChange={(e) =>
                      handleFilterChange("university", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Tất cả trường</option>
                    {filterOptions.universities.map((uni) => (
                      <option key={uni} value={uni}>
                        {uni}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Game Filter */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Gamepad2 className="w-5 h-5 text-indigo-400" />
                    <label className="text-sm font-medium text-white">
                      Game
                    </label>
                  </div>
                  <select
                    value={filters.game}
                    onChange={(e) => handleFilterChange("game", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Tất cả game</option>
                    {filterOptions.games.map((game) => (
                      <option key={game} value={game}>
                        {game}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Member Count Filter */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    <label className="text-sm font-medium text-white">
                      Số thành viên
                    </label>
                  </div>
                  <select
                    value={filters.memberCount}
                    onChange={(e) =>
                      handleFilterChange("memberCount", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Tất cả</option>
                    {filterOptions.memberCounts.map((count) => (
                      <option key={count.value} value={count.value}>
                        {count.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Activity Level Filter */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-indigo-400" />
                    <label className="text-sm font-medium text-white">
                      Mức độ hoạt động
                    </label>
                  </div>
                  <select
                    value={filters.activity}
                    onChange={(e) =>
                      handleFilterChange("activity", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Tất cả</option>
                    {filterOptions.activityLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label} - {level.desc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Privacy Filter */}
              <div className="mt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  <label className="text-sm font-medium text-white">
                    Quyền riêng tư
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {filterOptions.privacyTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <label key={type.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="privacy"
                          value={type.value}
                          checked={filters.privacy === type.value}
                          onChange={(e) =>
                            handleFilterChange("privacy", e.target.value)
                          }
                          className="sr-only"
                        />
                        <div
                          className={`p-4 rounded-lg border-2 transition-all ${
                            filters.privacy === type.value
                              ? "border-indigo-500 bg-indigo-500/20"
                              : "border-gray-600 bg-gray-700 hover:border-gray-500"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <IconComponent
                              className={`w-5 h-5 ${
                                type.value === "public"
                                  ? "text-emerald-400"
                                  : "text-yellow-400"
                              }`}
                            />
                            <span className="text-white font-medium">
                              {type.label}
                            </span>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Tags Filter */}
              <div className="mt-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Star className="w-5 h-5 text-indigo-400" />
                  <label className="text-sm font-medium text-white">
                    Tags phổ biến
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.popularTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                        filters.tags.includes(tag)
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {filters.tags.length > 0 && (
                  <p className="text-gray-400 text-sm mt-2">
                    Đã chọn: {filters.tags.join(", ")}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-700">
                <button
                  onClick={clearFilters}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Xóa bộ lọc
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Áp dụng bộ lọc
                </button>
              </div>

              {/* Active Filters Summary */}
              {getActiveFilterCount() > 0 && (
                <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                  <h4 className="text-white font-medium mb-2">
                    Bộ lọc đang áp dụng:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {filters.university && (
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                        🎓 {filters.university}
                      </span>
                    )}
                    {filters.game && (
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                        🎮 {filters.game}
                      </span>
                    )}
                    {filters.memberCount && (
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                        👥{" "}
                        {
                          filterOptions.memberCounts.find(
                            (c) => c.value === filters.memberCount
                          )?.label
                        }
                      </span>
                    )}
                    {filters.privacy && (
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                        🔒{" "}
                        {
                          filterOptions.privacyTypes.find(
                            (p) => p.value === filters.privacy
                          )?.label
                        }
                      </span>
                    )}
                    {filters.activity && (
                      <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm">
                        ⏰{" "}
                        {
                          filterOptions.activityLevels.find(
                            (a) => a.value === filters.activity
                          )?.label
                        }
                      </span>
                    )}
                    {filters.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm"
                      >
                        ⭐ {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {selectedTab === "my-communities" && (
        <div className="space-y-4">
          {myCommunities.map((community) => (
            <div
              key={community.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${community.color} rounded-xl flex items-center justify-center`}
                  >
                    <span className="text-lg font-bold text-white">
                      {community.avatar}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-bold text-white">
                        {community.name}
                      </h3>
                      {community.verified && (
                        <Verified className="w-5 h-5 text-blue-500" />
                      )}
                      {community.role === "Admin" && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                      {community.role === "Moderator" && (
                        <Shield className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {community.members.toLocaleString()} thành viên
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{community.university}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Hoạt động cuối: {community.lastActivity}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {community.unreadMessages > 0 && (
                    <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {community.unreadMessages}
                    </div>
                  )}
                  <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>Vào chat</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTab === "discover" && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* University Communities */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Cộng đồng trường bạn
            </h2>
            <div className="space-y-3">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <span className="font-bold">FPT</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">FPT Gaming Hub</h3>
                      <p className="text-gray-400 text-sm">892 thành viên</p>
                    </div>
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Tham gia
                  </button>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <span className="font-bold">FPT</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        FPT Mobile Legends
                      </h3>
                      <p className="text-gray-400 text-sm">534 thành viên</p>
                    </div>
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Tham gia
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Game Communities */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">
              Theo game yêu thích
            </h2>
            <div className="space-y-3">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <span className="font-bold">LoL</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        Vietnam LoL Students
                      </h3>
                      <p className="text-gray-400 text-sm">2,341 thành viên</p>
                    </div>
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Tham gia
                  </button>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center">
                      <span className="font-bold">VAL</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        Valorant VN Campus
                      </h3>
                      <p className="text-gray-400 text-sm">1,876 thành viên</p>
                    </div>
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Tham gia
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === "popular" && (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {popularCommunities.map((community) => (
            <div
              key={community.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="relative">
                {community.trending && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Trending</span>
                  </div>
                )}

                <div
                  className={`w-16 h-16 bg-gradient-to-r ${community.color} rounded-xl flex items-center justify-center mb-4`}
                >
                  <span className="text-lg font-bold text-white">
                    {community.avatar}
                  </span>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-bold text-white">
                    {community.name}
                  </h3>
                  {community.verified && (
                    <Verified className="w-5 h-5 text-blue-500" />
                  )}
                </div>

                <p className="text-gray-400 text-sm mb-3">
                  {community.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{community.members.toLocaleString()} thành viên</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{community.university}</span>
                  </div>
                </div>

                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                  Tham gia cộng đồng
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
