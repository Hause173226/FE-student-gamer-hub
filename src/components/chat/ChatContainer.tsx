import React, { useState, useEffect, useCallback } from 'react';
import { ChatMessage, EnhancedChatMessage, MessageType, MessageStatus, ConnectionState } from '../../types/chat';
import { chatService } from '../../services/chatService';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface ChatContainerProps {
  roomId: string;
  currentUserId?: string;
  className?: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  roomId,
  currentUserId,
  className = ''
}) => {
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  // Transform backend message to enhanced message
  const transformMessage = useCallback((message: ChatMessage): EnhancedChatMessage => {
    const timestamp = new Date(message.sentAt);
    const isOwn = message.fromUserId === currentUserId;
    
    return {
      ...message,
      type: MessageType.Text,
      status: MessageStatus.Delivered,
      isOwn,
      timestamp,
      formattedTime: timestamp.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      user: {
        id: message.fromUserId,
        name: `User ${message.fromUserId.slice(-4)}`, // Fallback name
        isOnline: true
      }
    };
  }, [currentUserId]);

  // Load initial messages
  const loadMessages = useCallback(async () => {
    if (!roomId || connectionState !== ConnectionState.Connected) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const historyMessages = await chatService.loadRoomHistory(roomId);
      const enhancedMessages = historyMessages.map(transformMessage);
      
      setMessages(enhancedMessages);
      setHasMore(enhancedMessages.length >= 50);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [roomId, connectionState, transformMessage]);

  // Send message
  const handleSendMessage = useCallback(async (text: string) => {
    if (!roomId || connectionState !== ConnectionState.Connected) return;

    try {
      // Add optimistic message
      const optimisticMessage: EnhancedChatMessage = {
        id: `temp-${Date.now()}`,
        channel: `room:${roomId}`,
        fromUserId: currentUserId || 'unknown',
        text,
        sentAt: new Date().toISOString(),
        type: MessageType.Text,
        status: MessageStatus.Sending,
        isOwn: true,
        timestamp: new Date(),
        formattedTime: new Date().toLocaleTimeString('vi-VN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        user: {
          id: currentUserId || 'unknown',
          name: 'You',
          isOnline: true
        }
      };

      setMessages(prev => [...prev, optimisticMessage]);

      // Send to server
      await chatService.sendRoomMessage(roomId, text);
      
      // Update optimistic message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id 
            ? { ...msg, status: MessageStatus.Sent }
            : msg
        )
      );
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
      
      // Mark message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id.startsWith('temp-') 
            ? { ...msg, status: MessageStatus.Failed }
            : msg
        )
      );
    }
  }, [roomId, connectionState, currentUserId]);

  // Handle new message received
  const handleMessageReceived = useCallback((message: ChatMessage) => {
    const roomChannel = `room:${roomId}`;
    if (message.channel === roomChannel) {
      const enhancedMessage = transformMessage(message);
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(msg => msg.id === message.id)) {
          return prev;
        }
        return [...prev, enhancedMessage];
      });
    }
  }, [roomId, transformMessage]);

  // Handle typing
  const handleTyping = useCallback((isTyping: boolean) => {
    setIsTyping(isTyping);
    // TODO: Send typing status to server
  }, []);

  // Load more messages
  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    try {
      setIsLoading(true);
      const lastMessage = messages[messages.length - 1];
      const afterId = lastMessage?.id;
      
      const historyMessages = await chatService.loadRoomHistory(roomId, afterId);
      const enhancedMessages = historyMessages.map(transformMessage);
      
      setMessages(prev => [...prev, ...enhancedMessages]);
      setHasMore(enhancedMessages.length >= 50);
    } catch (err) {
      console.error('Failed to load more messages:', err);
      setError('Failed to load more messages');
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, messages, roomId, transformMessage]);

  // Setup chat service event handlers
  useEffect(() => {
    chatService.onMessageReceived(handleMessageReceived);
    chatService.onConnectionStateChanged(setConnectionState);
    chatService.onError((err) => {
      console.error('Chat service error:', err);
      setError(err.message);
    });

    return () => {
      // Cleanup will be handled by the service singleton
    };
  }, [handleMessageReceived]);

  // Load messages when room changes or connection is established
  useEffect(() => {
    if (roomId && connectionState === ConnectionState.Connected) {
      loadMessages();
    }
  }, [roomId, connectionState, loadMessages]);

  // Join room when connected
  useEffect(() => {
    if (roomId && connectionState === ConnectionState.Connected) {
      chatService.joinRoom(roomId);
    }
  }, [roomId, connectionState]);

  const getConnectionStatus = () => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return { icon: Wifi, text: 'Connected', color: 'text-green-500' };
      case ConnectionState.Connecting:
        return { icon: Wifi, text: 'Connecting...', color: 'text-yellow-500' };
      case ConnectionState.Reconnecting:
        return { icon: Wifi, text: 'Reconnecting...', color: 'text-yellow-500' };
      case ConnectionState.Disconnected:
        return { icon: WifiOff, text: 'Disconnected', color: 'text-red-500' };
      default:
        return { icon: WifiOff, text: 'Unknown', color: 'text-gray-500' };
    }
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Connection status */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <StatusIcon className={`w-4 h-4 ${status.color}`} />
          <span className={`text-sm ${status.color}`}>{status.text}</span>
        </div>
        
        {isTyping && (
          <div className="text-sm text-gray-500">
            Someone is typing...
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        isLoading={isLoading}
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
            ? "Type a message..." 
            : "Connecting to chat..."
        }
      />
    </div>
  );
};

export default ChatContainer;
