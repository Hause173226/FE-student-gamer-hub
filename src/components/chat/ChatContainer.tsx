import React, { useState, useEffect, useCallback } from "react";
import {
  ChatMessage,
  EnhancedChatMessage,
  MessageType,
  MessageStatus,
  ConnectionState,
} from "../../types/chat";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";
import { chatService } from "../../services/chatService";
import { useSignalRChannel } from "../../hooks/useSignalRChannel";

interface ChatContainerProps {
  roomId: string;
  currentUserId?: string;
  className?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  roomId,
  currentUserId,
  className = "",
}) => {
  const channel = roomId ? `room:${roomId}` : "";
  const {
    messages: rawMessages,
    send: sendViaChannel,
    isLoading: isLoadingMessages, // Loading state from SignalR hook
  } = useSignalRChannel(channel, currentUserId || "");

  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    ConnectionState.Disconnected
  );
  const [error, setError] = useState<string | null>(null);
  const [hasMore] = useState(true); // Keep for now, can be implemented later
  const [isTyping, setIsTyping] = useState(false);

  // Transform backend message to enhanced message
  const transformMessage = useCallback(
    (message: ChatMessage | any): EnhancedChatMessage => {
      const timestamp = message.createdAt
        ? new Date(message.createdAt)
        : new Date(message.sentAt || Date.now());
      const isOwn = message.fromUserId === currentUserId;

      return {
        id: message.id,
        channel: message.channel || channel,
        fromUserId: message.fromUserId,
        toUserId: message.toUserId,
        roomId: message.roomId,
        text: message.text,
        sentAt:
          message.sentAt || (message.createdAt ?? new Date().toISOString()),
        type: MessageType.Text,
        status: MessageStatus.Delivered,
        isOwn,
        timestamp,
        formattedTime: timestamp.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        user: {
          id: message.fromUserId,
          name: `User ${String(message.fromUserId || "").slice(-4)}`,
          isOnline: true,
        },
      };
    },
    [currentUserId, channel]
  );

  // Keep messages in sync with rawMessages from the hook
  useEffect(() => {
    if (!rawMessages || rawMessages.length === 0) return;
    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id).filter(Boolean));
      const mapped = rawMessages
        .map((m) => transformMessage(m))
        .filter((m) => !existingIds.has(m.id));
      return [
        ...prev.filter((m) => m.id && !m.id.toString().startsWith("temp-")),
        ...mapped,
      ];
    });
  }, [rawMessages, transformMessage]);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (!roomId || connectionState !== ConnectionState.Connected) return;
    try {
      setIsLoading(true);
      setError(null);
      // Messages will be loaded automatically by useSignalRChannel hook
    } catch (err) {
      console.error("Failed to load messages:", err);
      setError("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [roomId, connectionState]);

  // Send message with optimistic UI
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!roomId || connectionState !== ConnectionState.Connected) return;
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: EnhancedChatMessage = {
        id: tempId,
        channel,
        fromUserId: currentUserId || "unknown",
        toUserId: undefined,
        roomId,
        text,
        sentAt: new Date().toISOString(),
        type: MessageType.Text,
        status: MessageStatus.Sending,
        isOwn: true,
        timestamp: new Date(),
        formattedTime: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        user: {
          id: currentUserId || "unknown",
          name: "You",
          isOnline: true,
        },
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        await sendViaChannel(text);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, status: MessageStatus.Sent } : m
          )
        );

        // No need to reload - new message will come via realtime event
      } catch (err: any) {
        console.error("Failed to send message:", err);
        setError("Failed to send message");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, status: MessageStatus.Failed } : m
          )
        );
      }
    },
    [roomId, connectionState, currentUserId, channel, sendViaChannel]
  );

  // Load more messages (pagination)
  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    try {
      setIsLoading(true);
      // Pagination not implemented yet in new hook
      console.log("Load more not implemented");
    } catch (err) {
      console.error("Failed to load more messages:", err);
      setError("Failed to load more messages");
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading]);

  // Handle typing indicator with debounce
  const handleTyping = useCallback(() => {
    setIsTyping(true);
    // Clear typing indicator after 3 seconds
    const timer = setTimeout(() => setIsTyping(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Setup chatService listeners
  useEffect(() => {
    chatService.onConnectionStateChanged(setConnectionState);
    chatService.onError((err) => {
      console.error("Chat service error:", err);
      setError(err?.message || "Chat error");
    });
  }, []);

  // When connected, load messages and join room
  useEffect(() => {
    if (roomId && connectionState === ConnectionState.Connected) {
      loadMessages();
      try {
        chatService.joinRoom(roomId);
      } catch (e) {
        console.error("Failed to join room:", e);
      }
    }
  }, [roomId, connectionState, loadMessages]);

  const getConnectionStatus = () => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return { icon: Wifi, text: "Đã kết nối", color: "text-green-500" };
      case ConnectionState.Connecting:
        return {
          icon: Wifi,
          text: "Đang kết nối...",
          color: "text-yellow-500",
        };
      case ConnectionState.Reconnecting:
        return {
          icon: Wifi,
          text: "Đang kết nối lại...",
          color: "text-yellow-500",
        };
      case ConnectionState.Disconnected:
        return { icon: WifiOff, text: "Mất kết nối", color: "text-red-500" };
      default:
        return {
          icon: WifiOff,
          text: "Không xác định",
          color: "text-gray-500",
        };
    }
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  return (
    <div className={`flex flex-col h-full bg-slate-900 ${className}`}>
      {/* Connection status */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center space-x-2">
          <StatusIcon className={`w-4 h-4 ${status.color}`} />
          <span className={`text-sm ${status.color}`}>{status.text}</span>
        </div>

        {isTyping && (
          <div className="text-sm text-slate-400">Ai đó đang nhập...</div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center space-x-2 px-4 py-2 bg-red-900/50 text-red-300 text-sm border-b border-red-800">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        isLoading={isLoading || isLoadingMessages}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        disabled={connectionState !== ConnectionState.Connected}
        placeholder={
          connectionState === ConnectionState.Connected
            ? "Nhập tin nhắn..."
            : "Đang kết nối..."
        }
      />
    </div>
  );
};

export default ChatContainer;
