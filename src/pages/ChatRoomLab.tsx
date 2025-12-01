import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  signalRChatService,
  SignalRChatService,
  ConnectionStatus,
} from "../services/signalRChatService";
import { ChatMessageDto } from "../types/chat";
import {
  PlugZap,
  Send,
  RefreshCw,
  MessageSquare,
  Users,
  History,
  Loader2,
  Hash,
} from "lucide-react";
import toast from "react-hot-toast";
import { Club } from "../types/club";
import { Room } from "../types/room";
import ClubService from "../services/clubService";
import RoomService from "../services/roomService";

const GUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

const formatTimestamp = (iso: string) =>
  new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const formatGuid = (value?: string | null) =>
  value ? `${value.substring(0, 6)}…${value.substring(value.length - 4)}` : "N/A";

export default function ChatRoomLab() {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    signalRChatService.getConnectionState()
  );
  const [roomIdInput, setRoomIdInput] = useState("");
  const [activeRoomId, setActiveRoomId] = useState<string>("");
  const [roomMessage, setRoomMessage] = useState("");
  const [dmTargetId, setDmTargetId] = useState("");
  const [dmMessage, setDmMessage] = useState("");
  const [roomLog, setRoomLog] = useState<string[]>([]);
  const [dmLog, setDmLog] = useState<string[]>([]);
  const [historyMessages, setHistoryMessages] = useState<ChatMessageDto[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);
  const [sendingRoomMessage, setSendingRoomMessage] = useState(false);
  const [sendingDm, setSendingDm] = useState(false);
  const [joinedRooms, setJoinedRooms] = useState<
    { club: Club; rooms: Room[] }[]
  >([]);
  const [loadingJoinedRooms, setLoadingJoinedRooms] = useState(false);

  const isConnected = connectionStatus === "connected";
  const roomChannel = useMemo(
    () =>
      activeRoomId ? SignalRChatService.getRoomChannel(activeRoomId) : undefined,
    [activeRoomId]
  );

  const appendLog = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    entry: string
  ) => {
    setter((prev) => [entry, ...prev].slice(0, 80));
  };

  useEffect(() => {
    if (!user) return;
    if (signalRChatService.isConnected()) return;
    signalRChatService.connect().catch((err) => {
      console.error("Failed to auto connect chat:", err);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadJoinedRooms();
  }, [user]);

  useEffect(() => {
    const unsubscribeConn = signalRChatService.onConnectionChange((status) => {
      setConnectionStatus(status);
    });

    const unsubscribeMsg = signalRChatService.onMessage((message) => {
      if (message.roomId) {
        appendLog(
          setRoomLog,
          `[${formatTimestamp(message.sentAt)}] Room ${formatGuid(
            message.roomId
          )} • ${formatGuid(message.fromUserId)}: ${message.text}`
        );
      } else {
        appendLog(
          setDmLog,
          `[${formatTimestamp(message.sentAt)}] DM ${formatGuid(
            message.channel
          )} • ${formatGuid(message.fromUserId)} → ${formatGuid(
            message.toUserId
          )}: ${message.text}`
        );
      }
    });

    const unsubscribeHistory = signalRChatService.onHistory((response) => {
      if (
        response.channel &&
        roomChannel &&
        response.channel.toLowerCase() === roomChannel.toLowerCase()
      ) {
        setHistoryMessages(response.items || []);
        toast.success(
          `Loaded ${response.items?.length || 0} messages from history`
        );
      }
    });

    const unsubscribeError = signalRChatService.onError((error) => {
      toast.error(error.message || "Chat error");
    });

    return () => {
      unsubscribeConn();
      unsubscribeMsg();
      unsubscribeHistory();
      unsubscribeError();
    };
  }, [roomChannel]);

  const ensureConnection = async () => {
    if (!user) {
      throw new Error("Bạn cần đăng nhập để sử dụng chat");
    }
    if (!signalRChatService.isConnected()) {
      await signalRChatService.connect();
    }
  };

  const handleConnect = async () => {
    try {
      await ensureConnection();
      toast.success("Đã kết nối SignalR");
    } catch (error: any) {
      console.error("Connect failed:", error);
      toast.error(error.message || "Không thể kết nối");
    }
  };

  const handleDisconnect = async () => {
    await signalRChatService.disconnect();
    setActiveRoomId("");
    setHistoryMessages([]);
    toast("Đã ngắt kết nối");
  };

  const handleJoinRoom = async () => {
    await joinRoomById(roomIdInput.trim());
  };

  const joinRoomById = async (roomId: string) => {
    const trimmed = roomId.trim();
    if (!GUID_REGEX.test(trimmed)) {
      toast.error("Room ID phải là GUID hợp lệ");
      return;
    }

    setJoiningRoom(true);
    try {
      await ensureConnection();
      await signalRChatService.joinRoom(trimmed);
      setActiveRoomId(trimmed);
      toast.success("Đã tham gia room!");
    } catch (error: any) {
      console.error("Join room failed:", error);
      toast.error(error.message || "Không thể tham gia room");
    } finally {
      setJoiningRoom(false);
    }
  };

  const loadJoinedRooms = async () => {
    setLoadingJoinedRooms(true);
    try {
      const clubs = await ClubService.getAllPublicClubs();
      const joined = clubs.filter((club) => club.isJoined);
      if (joined.length === 0) {
        setJoinedRooms([]);
        return;
      }

      const clubRooms = await Promise.all(
        joined.map(async (club) => {
          try {
            const rooms = await RoomService.getRoomsByClubId(
              club.id.toString()
            );
            return { club, rooms: rooms.filter((room) => room.isMember) };
          } catch (error) {
            console.warn("Failed to load rooms for club", club.id, error);
            return { club, rooms: [] as Room[] };
          }
        })
      );

      setJoinedRooms(clubRooms.filter((entry) => entry.rooms.length > 0));
    } catch (error) {
      console.error("Failed to load joined rooms:", error);
      toast.error("Không thể tải danh sách room đã tham gia");
    } finally {
      setLoadingJoinedRooms(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!activeRoomId) {
      toast.error("Bạn chưa tham gia room nào");
      return;
    }

    try {
      await signalRChatService.leaveRoom(activeRoomId);
      toast.success("Đã rời room");
      setActiveRoomId("");
      setHistoryMessages([]);
    } catch (error: any) {
      console.error("Leave room failed:", error);
      toast.error(error.message || "Không thể rời room");
    }
  };

  const handleSendRoomMessage = async () => {
    if (!activeRoomId) {
      toast.error("Hãy tham gia room trước");
      return;
    }
    if (!roomMessage.trim()) {
      toast.error("Nội dung tin nhắn không được để trống");
      return;
    }

    setSendingRoomMessage(true);
    try {
      await signalRChatService.sendToRoom(activeRoomId, roomMessage.trim());
      appendLog(
        setRoomLog,
        `[${new Date().toLocaleTimeString()}] Bạn → Room ${formatGuid(
          activeRoomId
        )}: ${roomMessage.trim()}`
      );
      setRoomMessage("");
    } catch (error: any) {
      console.error("Send room message failed:", error);
      toast.error(error.message || "Không thể gửi tin nhắn");
    } finally {
      setSendingRoomMessage(false);
    }
  };

  const handleSendDm = async () => {
    if (!GUID_REGEX.test(dmTargetId.trim())) {
      toast.error("User ID phải là GUID hợp lệ");
      return;
    }
    if (!dmMessage.trim()) {
      toast.error("Tin nhắn không được trống");
      return;
    }

    setSendingDm(true);
    try {
      await ensureConnection();
      await signalRChatService.sendDm(dmTargetId.trim(), dmMessage.trim());
      appendLog(
        setDmLog,
        `[${new Date().toLocaleTimeString()}] Bạn → ${formatGuid(
          dmTargetId
        )}: ${dmMessage.trim()}`
      );
      setDmMessage("");
    } catch (error: any) {
      console.error("Send DM failed:", error);
      toast.error(error.message || "Không thể gửi DM");
    } finally {
      setSendingDm(false);
    }
  };

  const handleLoadHistory = async () => {
    if (!activeRoomId) {
      toast.error("Hãy tham gia room trước");
      return;
    }

    setLoadingHistory(true);
    try {
      await signalRChatService.loadHistory(
        SignalRChatService.getRoomChannel(activeRoomId),
        undefined,
        30
      );
    } catch (error: any) {
      console.error("Load history failed:", error);
      toast.error(error.message || "Không thể tải lịch sử");
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Đăng nhập để thử Chat Lab
          </h2>
          <p className="text-gray-400">
            Tính năng này yêu cầu tài khoản để tạo kết nối SignalR bảo mật.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-indigo-400 text-sm uppercase tracking-wide mb-2">
                SignalR Control Center
              </p>
              <h1 className="text-3xl font-bold text-white mb-2">
                Chat Lab – DM & Room Tester
              </h1>
              <p className="text-gray-400">
                Thử join room, rời room, gửi tin nhắn và tải lịch sử với backend
                hiện tại. Giao diện đồng bộ theme GamerHub.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <StatusBadge status={connectionStatus} />
              <span>
                Đăng nhập dưới tên{" "}
                <span className="text-white font-semibold">
                  {user.fullName || user.userName || "Unknown"}
                </span>
              </span>
              <span className="text-xs text-gray-500">
                User ID: {formatGuid(user.id)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={handleConnect}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-colors"
            >
              <PlugZap className="w-4 h-4" />
              Kết nối
            </button>
            <button
              onClick={handleDisconnect}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
            >
              Ngắt kết nối
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-indigo-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Room Controls</h2>
                <p className="text-gray-400 text-sm">
                  Join / leave room và gửi tin nhắn theo GUID.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300">
                Room GUID
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  placeholder="vd: 123e4567-e89b-12d3-a456-426614174000"
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleJoinRoom}
                  disabled={joiningRoom}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white disabled:opacity-50"
                >
                  {joiningRoom ? "Đang join..." : "Join room"}
                </button>
                <button
                  onClick={handleLeaveRoom}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white disabled:opacity-50"
                  disabled={!activeRoomId}
                >
                  Leave
                </button>
              </div>
              {activeRoomId && (
                <p className="text-sm text-emerald-400">
                  Đang ở room: {activeRoomId}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Gửi tin nhắn vào room
              </label>
              <textarea
                value={roomMessage}
                onChange={(e) => setRoomMessage(e.target.value)}
                rows={3}
                placeholder={
                  activeRoomId
                    ? "Nhập nội dung tin nhắn..."
                    : "Hãy join một room trước"
                }
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSendRoomMessage}
                disabled={!activeRoomId || sendingRoomMessage}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {sendingRoomMessage ? "Đang gửi..." : "Gửi vào room"}
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                    Lịch sử room
                  </h3>
                  <p className="text-gray-500 text-xs">
                    Backend LoadHistory → event “history”
                  </p>
                </div>
                <button
                  onClick={handleLoadHistory}
                  disabled={!activeRoomId || loadingHistory}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm disabled:opacity-50"
                >
                  <History className="w-4 h-4" />
                  {loadingHistory ? "Đang tải..." : "Load 30 messages"}
                </button>
              </div>
              {historyMessages.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Chưa có lịch sử được tải.
                </p>
              ) : (
                <div className="bg-gray-900 border border-gray-700 rounded-lg max-h-64 overflow-y-auto divide-y divide-gray-800">
                  {historyMessages.map((msg) => (
                    <div key={msg.id} className="p-3 text-sm text-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>{formatGuid(msg.fromUserId)}</span>
                        <span>{formatTimestamp(msg.sentAt)}</span>
                      </div>
                      <p className="text-gray-100">{msg.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-indigo-400" />
              <div>
                <h2 className="text-xl font-bold text-white">
                  Direct Message Controls
                </h2>
                <p className="text-gray-400 text-sm">
                  Gửi DM bằng hub SendDm – backend tự tạo channel `dm:min_max`.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                User GUID cần chat
              </label>
              <input
                value={dmTargetId}
                onChange={(e) => setDmTargetId(e.target.value)}
                placeholder="Nhập GUID của người nhận"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Nội dung DM
              </label>
              <textarea
                rows={3}
                value={dmMessage}
                onChange={(e) => setDmMessage(e.target.value)}
                placeholder="Nhập nội dung DM..."
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleSendDm}
                disabled={sendingDm}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {sendingDm ? "Đang gửi..." : "Gửi DM"}
              </button>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm text-gray-300">
              <p className="font-semibold text-white mb-2">
                Hướng dẫn nhanh
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>JoinRoom/LeaveRoom dùng GUID thật của room đã được duyệt.</li>
                <li>
                  SendToRoom yêu cầu bạn đã ở room và có quyền trong backend.
                </li>
                <li>
                  LoadHistory sử dụng hub method mới `LoadHistory('room:xxx')`.
                </li>
                <li>
                  Khi nhận event <code className="text-indigo-300">msg</code>, hệ
                  thống tự phân loại vào log tương ứng.
                </li>
              </ul>
            </div>
          </section>
        </div>

        <section className="bg-gray-800 border border-gray-700 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Rooms bạn đã tham gia
              </h2>
              <p className="text-gray-400 text-sm">
                Chọn room đã được backend tạo sẵn để auto join, không cần gõ GUID.
              </p>
            </div>
            <button
              onClick={loadJoinedRooms}
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới
            </button>
          </div>

          {loadingJoinedRooms ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
          ) : joinedRooms.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm bg-gray-900 rounded-lg border border-gray-700">
              Bạn chưa có club nào với room sẵn. Tham gia club trước trong tab
              Cộng đồng nhé!
            </div>
          ) : (
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">
              {joinedRooms.map(({ club, rooms }) => (
                <div
                  key={club.id}
                  className="bg-gray-900 border border-gray-700 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold">
                        {club.name || "Club chưa đặt tên"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {rooms.length} room đang tham gia
                      </p>
                    </div>
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                      Đã tham gia
                    </span>
                  </div>

                  <div className="space-y-2">
                    {rooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                            <Hash className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">
                              {room.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {room.membersCount || 0} thành viên •{" "}
                              {room.joinPolicy || "Policy N/A"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setRoomIdInput(room.id);
                            joinRoomById(room.id);
                          }}
                          className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
                        >
                          Join nhanh
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LogCard
            title="Room Log"
            entries={roomLog}
            icon={<Users className="w-4 h-4" />}
          />
          <LogCard
            title="Direct Message Log"
            entries={dmLog}
            icon={<MessageSquare className="w-4 h-4" />}
          />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ConnectionStatus }) {
  const config: Record<
    ConnectionStatus,
    { label: string; color: string; dot: string }
  > = {
    connected: {
      label: "Đã kết nối",
      color: "text-emerald-400 bg-emerald-500/10",
      dot: "bg-emerald-400",
    },
    connecting: {
      label: "Đang kết nối",
      color: "text-yellow-400 bg-yellow-500/10",
      dot: "bg-yellow-400 animate-pulse",
    },
    reconnecting: {
      label: "Đang khôi phục",
      color: "text-orange-400 bg-orange-500/10",
      dot: "bg-orange-400 animate-pulse",
    },
    disconnected: {
      label: "Đã ngắt",
      color: "text-gray-400 bg-gray-700",
      dot: "bg-gray-500",
    },
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${config[status].color}`}
    >
      <span className={`w-2 h-2 rounded-full ${config[status].dot}`} />
      {config[status].label}
    </span>
  );
}

function LogCard({
  title,
  entries,
  icon,
}: {
  title: string;
  entries: string[];
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 text-white font-semibold">
        {icon}
        {title}
        <span className="ml-auto text-xs text-gray-500">
          {entries.length} dòng
        </span>
      </div>
      <div className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-4 overflow-y-auto max-h-[360px]">
        {entries.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có log.</p>
        ) : (
          <ul className="space-y-3 text-sm text-gray-300">
            {entries.map((entry, index) => (
              <li key={`${title}-${index}`} className="leading-relaxed">
                {entry}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

