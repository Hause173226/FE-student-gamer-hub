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
import { AudioCallModal } from "../components/AudioCallModal";

type TabType = "all" | "online" | "invites" | "sent";

const Friends: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [friends, setFriends] = useState<FriendDto[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsNextCursor, setFriendsNextCursor] = useState<string>();
  const [friendsHasMore, setFriendsHasMore] = useState(false);

  const [incomingRequests, setIncomingRequests] = useState<FriendRequestDto[]>(
    []
  );
  const [incomingPage, setIncomingPage] = useState(1);
  const [incomingTotalPages, setIncomingTotalPages] = useState(1);
  const [incomingLoading, setIncomingLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "all" || activeTab === "online") {
      loadFriends();
    } else if (activeTab === "invites") {
      loadIncomingRequests(1);
    }
  }, [activeTab]);

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
    } catch (err) {
      console.error("Load friends error:", err);
      setFriends([]);
    } finally {
      setFriendsLoading(false);
    }
  };

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
    } catch (err) {
      console.error("Load incoming requests error:", err);
      setIncomingRequests([]);
    } finally {
      setIncomingLoading(false);
    }
  };

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

  const handleAcceptIncomingRequest = async (userId: string) => {
    try {
      await friendService.acceptFriend(userId);
      setIncomingRequests((prev) => prev.filter((r) => r.UserId !== userId));
      loadFriends();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Không thể chấp nhận lời mời");
    }
  };

  const handleDeclineIncomingRequest = async (userId: string) => {
    try {
      await friendService.declineFriend(userId);
      setIncomingRequests((prev) => prev.filter((r) => r.UserId !== userId));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Không thể từ chối lời mời");
    }
  };

  const handleCancelInvite = async (userId: string) => {
    try {
      await friendService.cancelFriendInvite(userId);
      setFriends((prev) => prev.filter((f) => f.userId !== userId));
    } catch (err: any) {
      alert(err?.response?.data?.message || "Không thể hủy lời mời");
    }
  };

  const displayFriends = friends.filter((friend) => {
    if (!searchQuery) return true;
    return (
      friend.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.userName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const displayIncomingRequests = incomingRequests.filter((request) => {
    if (!searchQuery) return true;
    return (
      request.FullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.UserName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case "all":
        return { icon: <Users size={64} />, title: "Chưa có bạn bè nào" };
      case "online":
        return { icon: <UserX size={64} />, title: "Không có ai online" };
      case "invites":
        return { icon: <UserPlus size={64} />, title: "Không có lời mời" };
      case "sent":
        return { icon: <Send size={64} />, title: "Chưa gửi lời mời nào" };
      default:
        return { icon: <Users size={64} />, title: "Không tìm thấy" };
    }
  };

  const renderContent = () => {
    const items =
      activeTab === "invites" ? displayIncomingRequests : displayFriends;
    const loading = activeTab === "invites" ? incomingLoading : friendsLoading;
    const hasData =
      activeTab === "invites"
        ? incomingRequests.length > 0
        : friends.length > 0;

    if (loading && !hasData) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
          <p className="text-slate-400">Đang tải...</p>
        </div>
      );
    }

    if (items.length === 0) {
      const msg = getEmptyStateMessage();
      return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          {msg.icon}
          <p className="mt-2">{msg.title}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {activeTab === "invites"
          ? displayIncomingRequests.map((r) => (
              <IncomingRequestCard
                key={r.UserId}
                request={r}
                onAccept={handleAcceptIncomingRequest}
                onDecline={handleDeclineIncomingRequest}
              />
            ))
          : displayFriends.map((f) => (
              <FriendCard
                key={f.userId}
                friend={f}
                activeTab={activeTab}
                onCancel={handleCancelInvite}
              />
            ))}
      </div>
    );
  };

  const canLoadMore =
    activeTab === "invites"
      ? incomingPage < incomingTotalPages
      : activeTab === "all" || activeTab === "online"
      ? friendsHasMore
      : false;

  const isLoading = activeTab === "invites" ? incomingLoading : friendsLoading;

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Bạn bè 👥</h1>

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "all"
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab("online")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "online"
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Đang online
          </button>
          <button
            onClick={() => setActiveTab("invites")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "invites"
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Lời mời
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "sent"
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Đã gửi
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm bạn bè..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-700 text-white pl-10 pr-4 py-3 rounded-lg border border-slate-600 focus:border-indigo-500"
            />
          </div>
          <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg flex items-center gap-2">
            <Filter size={18} /> Lọc
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>

      {canLoadMore && !isLoading && (
        <button
          onClick={handleLoadMore}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg mt-4"
        >
          Tải thêm
        </button>
      )}
    </div>
  );
};

// Incoming friend request card
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
  const [loading, setLoading] = useState(false);

  const initials = request.FullName.slice(0, 2).toUpperCase();

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {request.AvatarUrl ? (
          <img
            src={request.AvatarUrl}
            alt={request.FullName}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 bg-indigo-600 text-white flex items-center justify-center rounded-full font-bold">
            {initials}
          </div>
        )}
        <div>
          <h3 className="text-white font-semibold">{request.FullName}</h3>
          <p className="text-sm text-slate-400">@{request.UserName}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onAccept(request.UserId)}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          ✓
        </button>
        <button
          onClick={() => onDecline(request.UserId)}
          disabled={loading}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Friend card with audio call integration
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
  const [isCalling, setIsCalling] = useState(false);

  const initials = friend.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const joinDate = new Date(friend.createdAt).toLocaleDateString("vi-VN");

  return (
    <>
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 flex items-start gap-4">
        {friend.avatarUrl ? (
          <img
            src={friend.avatarUrl}
            alt={friend.fullName}
            className="w-16 h-16 rounded-full object-cover"
          />
        ) : (
          <div className="w-16 h-16 bg-indigo-600 text-white flex items-center justify-center rounded-full font-bold text-xl">
            {initials}
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg">
            {friend.fullName}
          </h3>
          <p className="text-slate-400 text-sm">@{friend.userName}</p>
          <p className="text-slate-500 text-xs mt-1">Bạn bè từ {joinDate}</p>

          <div className="flex items-center gap-2 mt-3">
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
                <button
                  onClick={() => setIsCalling(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg"
                >
                  <Phone size={18} />
                </button>
                <button className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg">
                  <MoreVertical size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal gọi thoại */}
      <AudioCallModal
        open={isCalling}
        onClose={() => setIsCalling(false)}
        friendName={friend.fullName}
        channelId={`call-${friend.userId}`}
      />
    </>
  );
};

export default Friends;
