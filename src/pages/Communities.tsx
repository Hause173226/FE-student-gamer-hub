import { useState, useEffect } from "react";
import { Search, Plus, Filter, Users, MapPin, ArrowRight } from "lucide-react";
import communityService, { CommunityFilterParams } from "../services/CommunityService.ts";
import CommunityCreateForm from "./CommunityCreateForm.tsx";
import { CreateCommunityPayload, CommunitySummary } from "../types";
import ClubList from "../pages/ClubList.tsx";

// Hook để debounce (trì hoãn) việc gọi API khi người dùng đang gõ
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export function Communities() {
  const [selectedTab, setSelectedTab] = useState("my-communities");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [communities, setCommunities] = useState<CommunitySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

  // Hàm gọi API để lấy danh sách communities
  const fetchCommunities = async (params: CommunityFilterParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await communityService.getAllCommunities(params);
      setCommunities(response.Items || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách cộng đồng:", err);
      setError("Không thể tải danh sách cộng đồng. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // Khi tab hoặc search thay đổi thì gọi lại API
  useEffect(() => {
    if (selectedTab === "my-communities" || selectedTab === "discover") {
      fetchCommunities({ search: debouncedSearchTerm });
    }
  }, [selectedTab, debouncedSearchTerm]);

  // Hàm xử lý tạo mới community
  const handleCreateCommunity = async (data: CreateCommunityPayload) => {
    setIsSubmitting(true);
    try {
      const newCommunity = await communityService.createCommunity(data);
      alert(`Đã tạo thành công community: ${newCommunity.Name}`);
      setIsCreateFormOpen(false);
      fetchCommunities({ search: debouncedSearchTerm });
    } catch (error) {
      console.error("Lỗi khi tạo community:", error);
      alert("Tạo community thất bại, vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Khi bấm "Xem Clubs"
  const handleActionClick = (communityId: string) => {
    setSelectedCommunityId(communityId);
  };

  // Hàm render nội dung
  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center text-gray-400 p-10">Đang tải danh sách cộng đồng...</div>;
    }

    if (error) {
      return <div className="text-center text-red-400 p-10">{error}</div>;
    }

    // Nếu đã chọn 1 community → hiển thị danh sách club
    if (selectedCommunityId) {
      return (
          <div>
            <button
                onClick={() => setSelectedCommunityId(null)}
                className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              ← Quay lại danh sách cộng đồng
            </button>
            <ClubList communityId={selectedCommunityId} />
          </div>
      );
    }

    if (!communities || communities.length === 0) {
      return <div className="text-center text-gray-400 p-10">Không tìm thấy cộng đồng nào.</div>;
    }

    return (
        <div className="space-y-4">
          {communities.map((community) => (
              <div
                  key={community.Id}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  {/* Thông tin community */}
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {(community.Name || "").substring(0, 3).toUpperCase()}
                  </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{community.Name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{community.MembersCount} thành viên</span>
                        </div>
                        {community.School && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{community.School}</span>
                            </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nút xem clubs */}
                  <button
                      onClick={() => handleActionClick(community.Id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <span>Xem Clubs</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
          ))}
        </div>
    );
  };

  return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Cộng đồng sinh viên 🎓</h1>
          <p className="text-gray-400">Kết nối với game thủ trong trường và cả nước</p>
        </div>

        {/* Search và Action */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
                type="text"
                placeholder="Tìm cộng đồng..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-3">
            <button
                onClick={() => setShowFilterModal(true)}
                className="relative flex items-center space-x-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Lọc</span>
            </button>
            <button
                onClick={() => setIsCreateFormOpen(true)}
                className="flex items-center space-x-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Tạo cộng đồng</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
          <button
              onClick={() => setSelectedTab("my-communities")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === "my-communities"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
          >
            Cộng đồng của tôi
          </button>
          <button
              onClick={() => setSelectedTab("discover")}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTab === "discover"
                      ? "bg-indigo-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
              }`}
          >
            Khám phá
          </button>
        </div>

        {/* Form tạo community */}
        {isCreateFormOpen && (
            <CommunityCreateForm
                onSubmit={handleCreateCommunity}
                onClose={() => setIsCreateFormOpen(false)}
                isSubmitting={isSubmitting}
            />
        )}

        {/* Nội dung */}
        {(selectedTab === "my-communities" || selectedTab === "discover") && renderContent()}
      </div>
  );
}
