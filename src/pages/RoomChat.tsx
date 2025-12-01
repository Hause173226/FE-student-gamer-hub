import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Hash, ArrowLeft, Users, Loader2, Send, UserPlus } from "lucide-react";
import { RoomService } from "../services/roomService";
import { Room } from "../types/room";
import { useAuth } from "../contexts/AuthContext";
import {
  signalRChatService,
  ConnectionStatus,
} from "../services/signalRChatService";
import { ChatMessageDto } from "../types/chat";
import toast from "react-hot-toast";

export default function RoomChat() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [inputText, setInputText] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    signalRChatService.getConnectionState()
  );
  const [sending, setSending] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [roomJoined, setRoomJoined] = useState(false);
  const [isJoiningMembership, setIsJoiningMembership] = useState(false);

  const isConnected = connectionStatus === "connected";
  const roomChannel = useMemo(
    () => (roomId ? `room:${roomId}` : undefined),
    [roomId]
  );

  // Load room info
  useEffect(() => {
    if (!roomId) return;

    const loadRoom = async () => {
      try {
        setLoading(true);
        const roomData = await RoomService.getRoomById(roomId);
        setRoom(roomData);
        console.log("✅ Loaded room:", roomData);
        console.log("🔍 IsMember:", roomData.isMember);
      } catch (error) {
        console.error("❌ Failed to load room:", error);
        toast.error("Không thể tải thông tin room");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadRoom();
  }, [roomId, navigate]);

  // Connect to SignalR
  useEffect(() => {
    if (!user) return;

    const connectChat = async () => {
      try {
        if (!signalRChatService.isConnected()) {
          console.log("🔄 Connecting to SignalR...");
          await signalRChatService.connect();
          console.log("✅ Connected to SignalR");
        }
      } catch (error) {
        console.error("❌ Failed to connect chat:", error);
        toast.error("Không thể kết nối chat");
      }
    };

    connectChat();
  }, [user]);

  // Join room chat channel (only if user is member)
  useEffect(() => {
    if (
      !roomId ||
      !roomChannel ||
      !isConnected ||
      !room ||
      !room.isMember ||
      isJoiningRoom ||
      roomJoined
    ) {
      return;
    }

    let mounted = true;

    const setupRoom = async () => {
      setIsJoiningRoom(true);
      try {
        console.log(`🔄 Joining room chat: ${roomId}`);

        await signalRChatService.joinRoom(roomId);
        console.log(`✅ Joined room channel: ${roomChannel}`);

        if (!mounted) return;
        setRoomJoined(true);

        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log("🔄 Loading room history...");
        await signalRChatService.loadHistory(roomChannel, undefined, 50);
        console.log("✅ Requested room history");
      } catch (error) {
        console.error("❌ Failed to setup room:", error);
        if (mounted) {
          toast.error("Không thể tham gia room chat");
          setRoomJoined(false);
        }
      } finally {
        if (mounted) {
          setIsJoiningRoom(false);
        }
      }
    };

    setupRoom();

    return () => {
      mounted = false;
      if (roomId && roomJoined) {
        console.log(`🔄 Leaving room: ${roomId}`);
        signalRChatService.leaveRoom(roomId).catch(console.error);
        setRoomJoined(false);
      }
    };
  }, [roomId, roomChannel, isConnected, room, isJoiningRoom, roomJoined]);

  // Subscribe to SignalR events
  useEffect(() => {
    const unsubscribeConn = signalRChatService.onConnectionChange((status) => {
      setConnectionStatus(status);
      console.log("🔌 Connection status:", status);
      if (status === "disconnected") {
        setRoomJoined(false);
      }
    });

    const unsubscribeMsg = signalRChatService.onMessage((message) => {
      console.log("📨 Received message:", message);
      if (message.roomId === roomId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    });

    const unsubscribeHistory = signalRChatService.onHistory((response) => {
      if (response.channel?.toLowerCase() === roomChannel?.toLowerCase()) {
        setMessages(response.items || []);
        console.log(`✅ Loaded ${response.items?.length || 0} messages`);

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        }, 100);
      }
    });

    const unsubscribeError = signalRChatService.onError((error) => {
      console.error("❌ Chat error:", error);
      toast.error(error.message || "Lỗi kết nối chat");
    });

    return () => {
      unsubscribeConn();
      unsubscribeMsg();
      unsubscribeHistory();
      unsubscribeError();
    };
  }, [roomId, roomChannel]);

  // Handle join room membership
  const handleJoinRoom = async () => {
    if (!roomId) return;

    setIsJoiningMembership(true);
    try {
      console.log(`🔄 Joining room membership: ${roomId}`);
      await RoomService.joinRoom(roomId);

      // Reload room data to get updated isMember status
      const updatedRoom = await RoomService.getRoomById(roomId);
      setRoom(updatedRoom);

      toast.success("Đã tham gia room!");
      console.log("✅ Joined room membership");
    } catch (error: any) {
      console.error("❌ Failed to join room:", error);
      toast.error(error.message || "Không thể tham gia room");
    } finally {
      setIsJoiningMembership(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim() || !roomId || !isConnected || !roomJoined) {
      if (!roomJoined) {
        toast.error("Đang tham gia room, vui lòng chờ...");
      }
      return;
    }

    setSending(true);
    try {
      console.log(`📤 Sending message to room ${roomId}:`, inputText.trim());
      await signalRChatService.sendToRoom(roomId, inputText.trim());
      setInputText("");
      console.log("✅ Message sent successfully");
    } catch (error: any) {
      console.error("❌ Send message failed:", error);
      toast.error(error.message || "Không thể gửi tin nhắn");

      if (error.message?.includes("not a room member")) {
        console.log("🔄 Attempting to rejoin room...");
        setRoomJoined(false);
      }
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Đang tải room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Không tìm thấy room</p>
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

  // Show join room screen if not a member
  if (!room.isMember) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Hash className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">{room.name}</h1>

          {room.description && (
            <p className="text-gray-400 mb-6">{room.description}</p>
          )}

          <div className="flex items-center justify-center gap-4 mb-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{room.membersCount} thành viên</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>{room.joinPolicy === 1 ? "Công khai" : "Riêng tư"}</span>
            </div>
          </div>

          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-300">
              Bạn chưa tham gia room này. Tham gia để có thể chat và tương tác
              với các thành viên khác.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Quay lại
            </button>
            <button
              onClick={handleJoinRoom}
              disabled={isJoiningMembership}
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isJoiningMembership ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tham gia...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Tham gia room
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 bg-gray-800 border-b border-gray-700">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </button>

        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Hash className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-white text-lg">{room.name}</h1>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isConnected && roomJoined
                      ? "bg-green-500"
                      : isJoiningRoom
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-red-500"
                  }`}
                />
                <span>
                  {isConnected && roomJoined
                    ? "Đã kết nối"
                    : isJoiningRoom
                    ? "Đang tham gia room..."
                    : "Chưa kết nối"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{room.membersCount} thành viên</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Room Description (if exists) */}
      {room.description && (
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
          <p className="text-sm text-gray-400">{room.description}</p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isJoiningRoom ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-400">Đang tham gia room...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <Hash className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">
                Chào mừng đến với #{room.name}
              </p>
              <p className="text-sm">
                Đây là phòng chat của bạn. Hãy bắt đầu trò chuyện!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.fromUserId === user?.id;
            const timestamp = new Date(msg.sentAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={msg.id}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage ? "items-end" : "items-start"
                  }`}
                >
                  {!isOwnMessage && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {msg.fromUserId.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs text-gray-400">
                        User {msg.fromUserId.slice(-4)}
                      </span>
                      <span className="text-xs text-gray-500">{timestamp}</span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-800 text-gray-200"
                    }`}
                  >
                    <p className="text-sm break-words">{msg.text}</p>
                  </div>
                  {isOwnMessage && (
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {timestamp}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              !roomJoined
                ? "Đang tham gia room..."
                : `Nhắn tin tại #${room.name}...`
            }
            disabled={!isConnected || sending || !roomJoined || isJoiningRoom}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={
              !inputText.trim() ||
              !isConnected ||
              sending ||
              !roomJoined ||
              isJoiningRoom
            }
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Gửi
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
