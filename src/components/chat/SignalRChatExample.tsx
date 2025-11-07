/**
 * Example Chat Component using SignalR
 *
 * Demonstrates how to use the useSignalRChat hook for:
 * - Room chat
 * - DM chat
 * - Message history
 * - Connection status
 * - Error handling
 */

import React, { useState, useRef, useEffect } from "react";
import { useRoomChat, useDmChat } from "../../hooks/useSignalRChat";
import { ChatMessageDto } from "../../types/chat";

// ==================== ROOM CHAT EXAMPLE ====================

interface RoomChatProps {
  roomId: string;
  currentUserId: string;
}

export function RoomChatExample({ roomId, currentUserId }: RoomChatProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    connectionStatus,
    error,
    isConnected,
    isLoading,
    hasMoreHistory,
    sendMessage,
    loadMoreHistory,
    clearError,
  } = useRoomChat(roomId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    try {
      await sendMessage(inputText.trim());
      setInputText("");
    } catch (err) {
      console.error("Failed to send message:", err);
      // Error will be shown in UI via error state
    }
  };

  const handleLoadMore = async () => {
    try {
      await loadMoreHistory();
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Room Chat</h2>
        <div className="flex items-center gap-2 mt-2">
          <div
            className={`w-3 h-3 rounded-full ${
              connectionStatus === "connected"
                ? "bg-green-500"
                : connectionStatus === "connecting"
                ? "bg-yellow-500"
                : connectionStatus === "reconnecting"
                ? "bg-orange-500"
                : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-400 capitalize">
            {connectionStatus}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 p-3 m-4 rounded flex items-center justify-between">
          <div>
            <p className="font-semibold">{error.name}</p>
            <p className="text-sm text-gray-300">{error.message}</p>
          </div>
          <button
            onClick={clearError}
            className="px-3 py-1 bg-red-500/30 hover:bg-red-500/50 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Load More Button */}
        {hasMoreHistory && (
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Load More Messages"}
          </button>
        )}

        {/* Message List */}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={message.fromUserId === currentUserId}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="bg-gray-800 p-4 border-t border-gray-700"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!isConnected || !inputText.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

// ==================== DM CHAT EXAMPLE ====================

interface DmChatProps {
  currentUserId: string;
  targetUserId: string;
  targetUserName: string;
}

export function DmChatExample({
  currentUserId,
  targetUserId,
  targetUserName,
}: DmChatProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    connectionStatus,
    error,
    isConnected,
    isLoading,
    hasMoreHistory,
    sendMessage,
    loadMoreHistory,
    clearError,
  } = useDmChat(targetUserId, currentUserId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    try {
      await sendMessage(inputText.trim());
      setInputText("");
    } catch (err) {
      console.error("Failed to send DM:", err);
    }
  };

  const handleLoadMore = async () => {
    try {
      await loadMoreHistory();
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">DM with {targetUserName}</h2>
        <div className="flex items-center gap-2 mt-2">
          <div
            className={`w-3 h-3 rounded-full ${
              connectionStatus === "connected"
                ? "bg-green-500"
                : connectionStatus === "connecting"
                ? "bg-yellow-500"
                : connectionStatus === "reconnecting"
                ? "bg-orange-500"
                : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-400 capitalize">
            {connectionStatus}
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 p-3 m-4 rounded flex items-center justify-between">
          <div>
            <p className="font-semibold">{error.name}</p>
            <p className="text-sm text-gray-300">{error.message}</p>
          </div>
          <button
            onClick={clearError}
            className="px-3 py-1 bg-red-500/30 hover:bg-red-500/50 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {hasMoreHistory && (
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Load More Messages"}
          </button>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={message.fromUserId === currentUserId}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="bg-gray-800 p-4 border-t border-gray-700"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!isConnected || !inputText.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

// ==================== MESSAGE BUBBLE COMPONENT ====================

interface MessageBubbleProps {
  message: ChatMessageDto;
  isOwnMessage: boolean;
}

function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const formattedTime = new Date(message.sentAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isOwnMessage ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"
        }`}
      >
        {!isOwnMessage && (
          <div className="text-xs text-gray-400 mb-1">
            User {message.fromUserId.substring(0, 8)}
          </div>
        )}
        <div className="break-words">{message.text}</div>
        <div
          className={`text-xs mt-1 ${
            isOwnMessage ? "text-blue-200" : "text-gray-500"
          }`}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
}

// ==================== USAGE GUIDE ====================

/**
 * HOW TO USE IN YOUR APP:
 *
 * 1. For Room Chat:
 * ```tsx
 * import { RoomChatExample } from './components/chat/SignalRChatExample';
 *
 * function RoomPage() {
 *   const { user } = useAuth();
 *   const roomId = useParams().roomId;
 *
 *   return <RoomChatExample roomId={roomId} currentUserId={user.id} />;
 * }
 * ```
 *
 * 2. For DM Chat:
 * ```tsx
 * import { DmChatExample } from './components/chat/SignalRChatExample';
 *
 * function DirectMessagePage() {
 *   const { user } = useAuth();
 *   const targetUserId = useParams().userId;
 *
 *   return (
 *     <DmChatExample
 *       currentUserId={user.id}
 *       targetUserId={targetUserId}
 *       targetUserName="John Doe"
 *     />
 *   );
 * }
 * ```
 *
 * 3. Custom Usage with Hook:
 * ```tsx
 * import { useRoomChat } from '../hooks/useSignalRChat';
 *
 * function CustomChatComponent() {
 *   const {
 *     messages,
 *     sendMessage,
 *     connectionStatus,
 *     error
 *   } = useRoomChat('room-id-here');
 *
 *   // Your custom UI here
 * }
 * ```
 */
