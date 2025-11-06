import { useEffect, useRef, useState } from "react";
import {
  EnhancedChatMessage,
  MessageType,
  MessageStatus,
} from "../../types/chat";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface MessageListProps {
  messages: EnhancedChatMessage[];
  currentUserId?: string;
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  isLoading = false,
  onLoadMore,
  hasMore = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages, isNearBottom]);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsNearBottom(distanceFromBottom < 100);

    // Load more when near top
    if (scrollTop < 100 && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  };

  const formatMessageTime = (timestamp: Date): string => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: vi,
      });
    } catch {
      return "";
    }
  };

  const getMessageStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.Sending:
        return (
          <svg
            className="w-3 h-3 text-gray-400 animate-pulse"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
          </svg>
        );
      case MessageStatus.Sent:
        return (
          <svg
            className="w-3 h-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case MessageStatus.Delivered:
        return (
          <svg
            className="w-3 h-3 text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 13l4 4L23 7"
            />
          </svg>
        );
      case MessageStatus.Failed:
        return (
          <svg
            className="w-3 h-3 text-red-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderMessage = (message: EnhancedChatMessage, index: number) => {
    const isOwn = message.isOwn;
    const showAvatar =
      index === 0 || messages[index - 1].fromUserId !== message.fromUserId;
    const showTime =
      index === messages.length - 1 ||
      Math.abs(
        new Date(message.timestamp).getTime() -
          new Date(messages[index + 1]?.timestamp || 0).getTime()
      ) > 300000; // 5 minutes

    if (message.type === MessageType.System) {
      return (
        <div key={message.id} className="flex justify-center my-4">
          <div className="px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-sm">
            📢 {message.text}
          </div>
        </div>
      );
    }

    return (
      <div
        key={message.id}
        className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2 px-4`}
      >
        <div className={`flex items-end gap-2 max-w-[70%]`}>
          {/* Avatar bên trái (người khác) */}
          {!isOwn && (
            <div className="flex-shrink-0 w-8 h-8">
              {showAvatar ? (
                message.user?.avatar ? (
                  <img
                    src={message.user.avatar}
                    alt={message.user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold bg-gradient-to-br from-indigo-500 to-purple-600">
                    {message.user?.name?.slice(0, 2).toUpperCase() || "U"}
                  </div>
                )
              ) : (
                <div className="w-8 h-8"></div>
              )}
            </div>
          )}

          {/* Message content */}
          <div
            className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
          >
            {/* Username (chỉ hiển thị cho người khác) */}
            {!isOwn && showAvatar && (
              <div className="text-xs text-slate-400 mb-1 px-3 font-medium">
                {message.user?.name || "Unknown User"}
              </div>
            )}

            {/* Message bubble */}
            <div
              className={`px-4 py-2.5 rounded-2xl ${
                isOwn
                  ? "bg-indigo-600 text-white rounded-tr-sm"
                  : "bg-slate-800 text-white border border-slate-700 rounded-tl-sm"
              } shadow-sm`}
            >
              <div className="break-words whitespace-pre-wrap text-sm leading-relaxed">
                {message.text}
              </div>
            </div>

            {/* Message time and status */}
            {showTime && (
              <div
                className={`flex items-center gap-1 mt-1 px-3 ${
                  isOwn ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <span className="text-xs text-slate-500">
                  {formatMessageTime(message.timestamp)}
                </span>
                {isOwn && getMessageStatusIcon(message.status)}
              </div>
            )}
          </div>

          {/* Spacer bên phải (tin nhắn của mình) để giữ avatar space */}
          {isOwn && <div className="flex-shrink-0 w-8 h-8"></div>}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto bg-slate-900"
      onScroll={handleScroll}
    >
      <div className="min-h-full flex flex-col justify-end py-4">
        {/* Load more button */}
        {hasMore && (
          <div className="text-center py-2">
            <button
              onClick={onLoadMore}
              disabled={isLoading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Đang tải...
                </span>
              ) : (
                "Tải thêm tin nhắn"
              )}
            </button>
          </div>
        )}

        {/* Messages */}
        {messages.length === 0 && !isLoading ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg font-medium mb-1">Chưa có tin nhắn</p>
              <p className="text-sm">Bắt đầu cuộc trò chuyện ngay!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message, index) => renderMessage(message, index))}
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          </div>
        )}

        {/* Auto scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {!isNearBottom && messages.length > 0 && (
        <button
          onClick={() => scrollToBottom()}
          className="fixed bottom-24 right-8 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MessageList;
