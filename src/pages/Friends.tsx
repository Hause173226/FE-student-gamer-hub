import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  UserPlus,
  MessageCircle,
  Phone,
  MoreVertical,
  Users,
  UserX,
  Send,
  Loader2,
} from "lucide-react";
import friendService, {
  FriendDto,
  FriendRequestDto,
} from "../services/friendService";
import { useNavigate } from "react-router-dom";

type TabType = "all" | "online" | "invites" | "sent";

const Friends: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ State riêng cho FRIENDS (Tất cả & Online)
  const [friends, setFriends] = useState<FriendDto[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsNextCursor, setFriendsNextCursor] = useState<
    string | undefined
  >();
  const [friendsHasMore, setFriendsHasMore] = useState(false);

  // ✅ State riêng cho INCOMING REQUESTS (Lời mời)
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestDto[]>(
    []
  );
  const [incomingPage, setIncomingPage] = useState(1);
  const [incomingTotalPages, setIncomingTotalPages] = useState(1);
  const [incomingLoading, setIncomingLoading] = useState(false);

  // ✅ Load data dựa trên tab
  useEffect(() => {
    if (activeTab === "all" || activeTab === "online") {
      loadFriends(); // Load friends list
    } else if (activeTab === "invites") {
      loadIncomingRequests(1); // Load incoming requests
    } else if (activeTab === "sent") {
      // TODO: Load outgoing requests khi backend có API
      // setFriends([]);
    }
  }, [activeTab]);

  // ✅ Load Friends (cho tab "Tất cả" và "Đang online")
  const loadFriends = async (cursor?: string) => {
    try {
      setFriendsLoading(true);
      const result = await friendService.getAllFriends(cursor, 20);

      if (cursor) {
        setFriends((prev) => [...prev, ...result.items]);
      } else {
        setFriends(result.items || []);
      }

      setFriendsNextCursor(result.nextCursor);
      setFriendsHasMore(result.hasMore);
    } catch (err: any) {
      console.error("Load friends error:", err);
      setFriends([]);
    } finally {
      setFriendsLoading(false);
    }
  };

  // ✅ Load Incoming Requests (cho tab "Lời mời")
  const loadIncomingRequests = async (page: number = 1) => {
    try {
      setIncomingLoading(true);
      const result = await friendService.getIncomingRequests({
        Page: page,
        Size: 20,
      });

      if (page === 1) {
        setIncomingRequests(result.Items);
      } else {
        setIncomingRequests((prev) => [...prev, ...result.Items]);
      }

      setIncomingPage(result.Page);
      setIncomingTotalPages(result.TotalPages);
    } catch (err: any) {
      console.error("Load incoming requests error:", err);
      setIncomingRequests([]);
    } finally {
      setIncomingLoading(false);
    }
  };

  // ✅ Load more dựa trên tab
  const handleLoadMore = () => {
    if (activeTab === "invites") {
      if (incomingPage < incomingTotalPages && !incomingLoading) {
        loadIncomingRequests(incomingPage + 1);
      }
    } else if (activeTab === "all" || activeTab === "online") {
      if (friendsNextCursor && !friendsLoading) {
        loadFriends(friendsNextCursor);
      }
    }
  };

  // ✅ Accept incoming request
  const handleAcceptIncomingRequest = async (userId: string) => {
    try {
      await friendService.acceptFriend(userId);
      setIncomingRequests((prev) => prev.filter((r) => r.UserId !== userId));
      // Reload friends list để hiện người vừa kết bạn
      if (activeTab === "all" || activeTab === "online") {
        loadFriends();
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Không thể chấp nhận lời mời");
    }
  };

  // ✅ Decline incoming request
  const handleDeclineIncomingRequest = async (userId: string) => {
    try {
      await friendService.declineFriend(userId);
      setIncomingRequests((prev) => prev.filter((r) => r.UserId !== userId));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Không thể từ chối lời mời");
    }
  };

  // ✅ Cancel outgoing request (cho tab "Đã gửi")
  const handleCancelInvite = async (userId: string) => {
    try {
      await friendService.cancelFriendInvite(userId);
      setFriends((prev) => prev.filter((f) => f.userId !== userId));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Không thể hủy lời mời");
    }
  };

  // ✅ Filter friends theo search
  const displayFriends = (friends || []).filter((friend) => {
    if (!searchQuery) return true;
    return (
      friend.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.userName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // ✅ Filter incoming requests theo search
  const displayIncomingRequests = (incomingRequests || []).filter((request) => {
    if (!searchQuery) return true;
    return (
      request.FullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.UserName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // ✅ Empty state message
  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case "all":
        return {
          icon: <Users size={64} className="mb-4 opacity-50" />,
          title: "Chưa có bạn bè nào",
          description: "Hãy bắt đầu kết nối với những người cùng đam mê game!",
        };
      case "online":
        return {
          icon: <UserX size={64} className="mb-4 opacity-50" />,
          title: "Không có bạn bè nào đang online",
          description: "Các bạn của bạn hiện đang offline.",
        };
      case "invites":
        return {
          icon: <UserPlus size={64} className="mb-4 opacity-50" />,
          title: "Không có lời mời kết bạn",
          description: "Bạn chưa có lời mời kết bạn nào đang chờ xử lý.",
        };
      case "sent":
        return {
          icon: <Send size={64} className="mb-4 opacity-50" />,
          title: "Chưa gửi lời mời nào",
          description: "Tìm kiếm và gửi lời mời kết bạn cho người khác!",
        };
      default:
        return {
          icon: <Users size={64} className="mb-4 opacity-50" />,
          title: "Không tìm thấy",
          description: "",
        };
    }
  };

  // ✅ Render content dựa trên tab
  const renderContent = () => {
    // Xác định items và loading state cho tab hiện tại
    const items =
      activeTab === "invites"
        ? displayIncomingRequests
        : activeTab === "sent"
        ? [] // ✅ Tab "Đã gửi" tạm thời empty
        : displayFriends; // Tab "Tất cả" & "Đang online"

    const loading = activeTab === "invites" ? incomingLoading : friendsLoading;
    const hasData =
      activeTab === "invites"
        ? incomingRequests.length > 0
        : activeTab === "sent"
        ? false // ✅ Tab "Đã gửi" chưa có data
        : friends.length > 0;

    // Show loading khi lần đầu load
    if (loading && !hasData) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
          <p className="text-slate-400">Đang tải...</p>
        </div>
      );
    }

    // Show empty state
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          {searchQuery ? (
            <>
              <Search size={64} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">
                Không tìm thấy "{searchQuery}"
              </p>
              <p className="text-sm mt-2">Thử tìm kiếm với từ khóa khác</p>
            </>
          ) : (
            <>
              {getEmptyStateMessage().icon}
              <p className="text-lg font-medium">
                {getEmptyStateMessage().title}
              </p>
              <p className="text-sm mt-2 text-center max-w-md">
                {getEmptyStateMessage().description}
              </p>
              {activeTab === "all" && (
                <button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <UserPlus size={18} />
                  Tìm bạn bè
                </button>
              )}
            </>
          )}
        </div>
      );
    }

    // Show items
    return (
      <div className="space-y-3">
        {activeTab === "invites"
          ? displayIncomingRequests.map((request) => (
              <IncomingRequestCard
                key={request.UserId}
                request={request}
                onAccept={handleAcceptIncomingRequest}
                onDecline={handleDeclineIncomingRequest}
              />
            ))
          : displayFriends.map((friend) => (
              <FriendCard
                key={friend.userId}
                friend={friend}
                activeTab={activeTab}
                onCancel={handleCancelInvite}
              />
            ))}
      </div>
    );
  };

  // ✅ Check if can load more
  const canLoadMore =
    activeTab === "invites"
      ? incomingPage < incomingTotalPages
      : activeTab === "sent"
      ? false // ✅ Tab "Đã gửi" chưa có pagination
      : activeTab === "all" || activeTab === "online"
      ? friendsHasMore
      : false;

  const hasItems =
    activeTab === "invites"
      ? incomingRequests.length > 0
      : activeTab === "sent"
      ? false // ✅ Tab "Đã gửi" chưa có data
      : friends.length > 0;

  const isLoading =
    activeTab === "invites"
      ? incomingLoading
      : activeTab === "sent"
      ? false // ✅ Tab "Đã gửi" không loading
      : friendsLoading;

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Bạn bè 👥
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Kết nối và chơi game cùng bạn bè
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm bạn bè theo tên, trường..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-700 text-white pl-10 pr-4 py-3 rounded-lg border border-slate-600 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
          <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg flex items-center gap-2 border border-slate-600 transition-colors">
            <Filter size={18} />
            Lọc
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "all"
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Tất cả{" "}
            <span className="ml-2 bg-slate-900/50 px-2 py-0.5 rounded-full text-sm">
              {friends.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("online")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "online"
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Đang online{" "}
            <span className="ml-2 bg-slate-900/50 px-2 py-0.5 rounded-full text-sm">
              {friends.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("invites")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors relative ${
              activeTab === "invites"
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Lời mời{" "}
            <span className="ml-2 bg-slate-900/50 px-2 py-0.5 rounded-full text-sm">
              {incomingRequests.length}
            </span>
            {incomingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                {incomingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "sent"
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Đã gửi{" "}
            <span className="ml-2 bg-slate-900/50 px-2 py-0.5 rounded-full text-sm">
              0
            </span>
          </button>
        </div>
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderContent()}

        {/* Load More Button */}
        {canLoadMore && !isLoading && hasItems && (
          <button
            onClick={handleLoadMore}
            className="w-full mt-4 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg transition-colors font-medium"
          >
            Tải thêm
          </button>
        )}

        {/* Loading More Indicator */}
        {isLoading && hasItems && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mr-2" />
            <span className="text-slate-400">Đang tải...</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ Incoming Request Card Component
interface IncomingRequestCardProps {
  request: FriendRequestDto;
  onAccept: (userId: string) => void;
  onDecline: (userId: string) => void;
}

const IncomingRequestCard: React.FC<IncomingRequestCardProps> = ({
  request,
  onAccept,
  onDecline,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await onAccept(request.UserId);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    try {
      await onDecline(request.UserId);
    } finally {
      setIsProcessing(false);
    }
  };

  const initials = request.FullName.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const timeAgo = new Date(request.RequestedAtUtc).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-indigo-500/50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          {request.AvatarUrl ? (
            <img
              src={request.AvatarUrl}
              alt={request.FullName}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/50"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl ring-2 ring-indigo-500/50">
              {initials}
            </div>
          )}
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
            <UserPlus size={14} className="text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg truncate mb-1">
            {request.FullName}
          </h3>
          <p className="text-sm text-slate-400 truncate mb-1">
            @{request.UserName}
            {request.University && ` • ${request.University}`}
          </p>
          <p className="text-xs text-slate-500">Gửi lời mời lúc {timeAgo}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              "✓"
            )}
            Chấp nhận
          </button>
          <button
            onClick={handleDecline}
            disabled={isProcessing}
            className="bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 text-white px-4 py-2 rounded-lg transition-colors font-medium disabled:cursor-not-allowed"
          >
            Từ chối
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ Friend Card Component
interface FriendCardProps {
  friend: FriendDto;
  activeTab: TabType;
  onCancel: (userId: string) => void;
}

const FriendCard: React.FC<FriendCardProps> = ({
  friend,
  activeTab,
  onCancel,
}) => {
  const navigate = useNavigate();
  const initials = friend.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joinDate = new Date(friend.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex items-start gap-4">
        <div className="relative flex-shrink-0">
          {friend.avatarUrl ? (
            <img
              src={friend.avatarUrl}
              alt={friend.fullName}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              {initials}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg truncate mb-1">
                {friend.fullName}
              </h3>
              <p className="text-sm text-slate-400 truncate">
                @{friend.userName}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Bạn bè từ {joinDate}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {activeTab === "sent" && (
                <button
                  onClick={() => onCancel(friend.userId)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Hủy lời mời
                </button>
              )}
              {(activeTab === "all" || activeTab === "online") && (
                <>
                  <button
                    onClick={() =>
                      navigate(`/chat/dm/${friend.userId}`, {
                        state: {
                          userName: friend.userName,
                          fullName: friend.fullName,
                          avatarUrl: friend.avatarUrl,
                        },
                      })
                    }
                    title={`Nhắn tin tới ${friend.fullName}`}
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <MessageCircle size={18} />
                  </button>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors">
                    <Phone size={18} />
                  </button>
                  <button className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
