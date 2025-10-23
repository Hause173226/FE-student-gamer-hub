import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, EnhancedChatMessage, MessageType, MessageStatus } from '../../types/chat';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

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
  hasMore = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isNearTop, setIsNearTop] = useState(false);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (!isNearTop) {
      scrollToBottom();
    }
  }, [messages, isNearTop]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    setIsNearTop(scrollTop < 100);
  };

  const formatMessageTime = (timestamp: Date): string => {
    return formatDistanceToNow(timestamp, { 
      addSuffix: true, 
      locale: vi 
    });
  };

  const getMessageStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case MessageStatus.Sending:
        return <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />;
      case MessageStatus.Sent:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      case MessageStatus.Delivered:
        return <div className="w-2 h-2 bg-blue-400 rounded-full" />;
      case MessageStatus.Failed:
        return <div className="w-2 h-2 bg-red-400 rounded-full" />;
      default:
        return null;
    }
  };

  const renderMessage = (message: EnhancedChatMessage, index: number) => {
    const isOwn = message.isOwn;
    const showAvatar = index === 0 || messages[index - 1].fromUserId !== message.fromUserId;
    const showTime = index === messages.length - 1 || 
      new Date(message.timestamp).getTime() - new Date(messages[index + 1].timestamp).getTime() > 300000; // 5 minutes

    return (
      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className={`flex max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          {!isOwn && showAvatar && (
            <div className="flex-shrink-0 mr-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {message.user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          )}

          {/* Message content */}
          <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
            {/* Username */}
            {!isOwn && showAvatar && (
              <div className="text-xs text-gray-500 mb-1 px-2">
                {message.user?.name || 'Unknown User'}
              </div>
            )}

            {/* Message bubble */}
            <div
              className={`px-4 py-2 rounded-2xl ${
                isOwn
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-900'
              } ${
                message.type === MessageType.System
                  ? 'bg-yellow-100 text-yellow-800 text-center text-sm'
                  : ''
              }`}
            >
              {message.type === MessageType.System ? (
                <div className="text-center">
                  <span className="text-xs">📢 {message.text}</span>
                </div>
              ) : (
                <div className="break-words">{message.text}</div>
              )}
            </div>

            {/* Message time and status */}
            <div className={`flex items-center mt-1 px-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className="text-xs text-gray-500">
                {formatMessageTime(message.timestamp)}
              </span>
              {isOwn && (
                <div className={`ml-1 ${isOwn ? 'mr-1' : 'ml-1'}`}>
                  {getMessageStatusIcon(message.status)}
                </div>
              )}
            </div>
          </div>

          {/* Own avatar */}
          {isOwn && showAvatar && (
            <div className="flex-shrink-0 ml-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {currentUserId?.charAt(0) || 'M'}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1" onScroll={handleScroll}>
      {/* Load more button */}
      {hasMore && (
        <div className="text-center py-2">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load more messages'}
          </button>
        </div>
      )}

      {/* Messages */}
      {messages.length === 0 && !isLoading ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-4xl mb-2">💬</div>
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        </div>
      ) : (
        messages.map((message, index) => renderMessage(message, index))
      )}

      {/* Loading indicator */}
      {isLoading && messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      )}

      {/* Scroll to bottom button */}
      {isNearTop && messages.length > 0 && (
        <div className="fixed bottom-20 right-4">
          <button
            onClick={scrollToBottom}
            className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
          >
            ↓
          </button>
        </div>
      )}

      {/* Auto scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
