import { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSignalRChannel } from "../hooks/useSignalRChannel";
import ChatInput from "../components/chat/ChatInput";
import MessageList from "../components/chat/MessageList";
import { EnhancedChatMessage, MessageType, MessageStatus } from "../types/chat";
import { ChatMessage } from "../hooks/useSignalRChannel";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { getUserIdFromToken } from "../utils/tokenUtils";
import userService, { UserInfoResponse } from "../services/userService";

export default function ChatPage() {
  const { otherId } = useParams<{ otherId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [otherUser, setOtherUser] = useState<UserInfoResponse | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // ✅ Lấy thông tin user từ location state (được truyền từ Friends page)
  const userFromState = location.state as {
    userName?: string;
    fullName?: string;
    avatarUrl?: string;
  } | null;

  // ✅ Get user ID from JWT token
  const meId = useMemo(() => {
    const userId = getUserIdFromToken();
    if (!userId) {
      console.error("❌ Cannot get user ID from token. Please login again.");
    }
    return userId;
  }, []);

  const dmChannel = useMemo(() => {
    if (!meId || !otherId) {
      return "";
    }
    const ids = [meId, otherId].sort();
    return `dm:${ids[0]}_${ids[1]}`;
  }, [meId, otherId]);

  const {
    messages: rawMessages,
    send,
    isLoading,
    isConnected,
  } = useSignalRChannel(dmChannel, meId || "");

  // Debug: Log connection status
  useEffect(() => {
    console.log(
      "🔌 ChatPage - isConnected:",
      isConnected,
      "channel:",
      dmChannel
    );
  }, [isConnected, dmChannel]);

  // Transform raw messages to EnhancedChatMessage format
  const mappedMessages: EnhancedChatMessage[] = useMemo(() => {
    if (!rawMessages || !meId) return [];

    return rawMessages.map((msg: ChatMessage) => {
      const timestamp = msg.sentAt ? new Date(msg.sentAt) : new Date();
      const sentAt = msg.sentAt || timestamp.toISOString();
      const fromUserId = msg.fromUserId || "";
      const isOwn = fromUserId === meId;

      // ✅ Lấy tên thật từ otherUser nếu tin nhắn không phải của mình
      const userName = isOwn
        ? "Bạn"
        : otherUser?.fullName ||
          otherUser?.userName ||
          `User ${fromUserId.slice(-4)}`;

      const userAvatar = isOwn ? "" : otherUser?.avatarUrl || "";

      return {
        // ChatMessage base fields
        id: msg.id || `${fromUserId}-${timestamp.getTime()}`,
        channel: dmChannel,
        fromUserId,
        toUserId: msg.toUserId || otherId || "",
        roomId: undefined,
        text: msg.text || "",
        sentAt,

        // EnhancedChatMessage additional fields
        type: MessageType.Text,
        status: MessageStatus.Sent,
        isOwn,
        user: {
          id: fromUserId,
          name: userName,
          avatar: userAvatar,
          isOnline: true,
        },
        timestamp,
        formattedTime: formatDistanceToNow(timestamp, {
          addSuffix: true,
          locale: vi,
        }),
      } as EnhancedChatMessage;
    });
  }, [rawMessages, meId, otherId, dmChannel, otherUser]);

  // Fetch user information
  useEffect(() => {
    if (!otherId) return;

    // ✅ Ưu tiên dùng thông tin từ location state (từ Friends page)
    if (userFromState?.userName || userFromState?.fullName) {
      setOtherUser({
        id: otherId,
        userName: userFromState.userName || "",
        fullName: userFromState.fullName || "",
        email: "",
        avatarUrl: userFromState.avatarUrl,
      });
      setIsLoadingUser(false);
      return;
    }

    // ❌ Fallback: Gọi API (sẽ lỗi 403 vì chỉ admin mới dùng được)
    setIsLoadingUser(true);
    userService
      .getUserById(otherId)
      .then((userData) => {
        setOtherUser(userData);
      })
      .catch((error) => {
        console.error("❌ Failed to fetch user info:", error);
        // Fallback: Dùng User ID làm tên tạm
        setOtherUser({
          id: otherId,
          userName: `User ${otherId.slice(-4)}`,
          fullName: `User ${otherId.slice(-4)}`,
          email: "",
        });
      })
      .finally(() => {
        setIsLoadingUser(false);
      });
  }, [otherId, userFromState]);

  useEffect(() => {
    if (!meId || !otherId) {
      navigate("/friends");
    }
  }, [meId, otherId, navigate]);

  if (!meId || !otherId) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header - Style giống Dashboard/Friends với nền đen */}
      <div className="flex items-center gap-3 px-6 py-4 bg-slate-800 border-b border-slate-700 shadow-lg">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-700 rounded-xl transition-all duration-200 hover:scale-105"
        >
          <svg
            className="w-5 h-5 text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            {otherUser?.avatarUrl ? (
              <img
                src={otherUser.avatarUrl}
                alt={otherUser.fullName || otherUser.userName}
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500 shadow-md"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                {otherUser?.fullName
                  ? otherUser.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : otherId.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-slate-800 rounded-full"></div>
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-white text-lg">
              {isLoadingUser ? (
                <span className="animate-pulse">Đang tải...</span>
              ) : (
                otherUser?.fullName ||
                otherUser?.userName ||
                `User ${otherId.slice(-4)}`
              )}
            </h1>
            <div className="flex items-center gap-2 text-xs">
              <div
                className={`w-2 h-2 rounded-full ${
                  !isConnected ? "bg-yellow-500 animate-pulse" : "bg-green-500"
                }`}
              ></div>
              <p className="text-slate-400">
                {!isConnected ? "Đang kết nối..." : "Đang hoạt động"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages - Nền đen */}
      <div className="flex-1 overflow-auto bg-slate-900">
        <MessageList
          messages={mappedMessages}
          currentUserId={meId}
          isLoading={isLoading}
          onLoadMore={async () => {}}
          hasMore={false}
        />
      </div>

      {/* Input - Style nền đen */}
      <div className="bg-slate-800 border-t border-slate-700 shadow-lg">
        <ChatInput
          onSendMessage={async (text) => {
            if (!isConnected) {
              alert("Đang kết nối, vui lòng đợi...");
              return;
            }
            if (!meId) {
              alert("Không tìm thấy thông tin người dùng");
              return;
            }
            try {
              await send(text);
            } catch (e) {
              console.error("❌ Send DM failed", e);
              const errorMessage =
                e instanceof Error
                  ? e.message
                  : "Gửi tin thất bại. Vui lòng thử lại.";
              alert(errorMessage);
            }
          }}
          onTyping={() => {}}
          disabled={!meId || !isConnected}
        />
      </div>
    </div>
  );
}
