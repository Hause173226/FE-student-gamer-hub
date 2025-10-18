import { useEffect, useRef, useState, useCallback } from 'react';
import { ChatMessage } from '../services/platformGameService';

interface UseSimpleWebSocketProps {
  roomId: number;
  username: string;
  onMessageReceived?: (message: ChatMessage) => void;
}

export const useSimpleWebSocket = ({ roomId, username, onMessageReceived }: UseSimpleWebSocketProps) => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  // Connect to WebSocket
  useEffect(() => {
    try {
      // Simple WebSocket connection (không dùng STOMP)
      const ws = new WebSocket(`ws://localhost:8080/ws/chat`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket Connected to room:', roomId);
        setConnected(true);
        
        // Join room
        ws.send(JSON.stringify({
          type: 'JOIN_ROOM',
          roomId,
          username
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Message received:', data);
          
          if (data.type === 'CHAT_MESSAGE') {
            const chatMessage: ChatMessage = {
              roomId: data.roomId,
              userId: data.userId,
              username: data.username,
              message: data.message,
              timestamp: data.timestamp
            };
            
            setMessages(prev => [...prev, chatMessage]);
            onMessageReceived?.(chatMessage);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket Disconnected');
        setConnected(false);
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket Error:', error);
        setConnected(false);
      };

      // Cleanup on unmount
      return () => {
        if (wsRef.current) {
          console.log('🔌 Disconnecting WebSocket...');
          wsRef.current.close();
        }
      };
    } catch (error) {
      console.error('❌ WebSocket setup error:', error);
      setConnected(false);
    }
  }, [roomId, username, onMessageReceived]);

  // Send message
  const sendMessage = useCallback((messageText: string, userId: number) => {
    if (!wsRef.current || !connected) {
      console.warn('⚠️ Cannot send message: WebSocket not connected');
      return;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: 'SEND_MESSAGE',
        roomId,
        userId,
        username,
        message: messageText,
        timestamp: new Date().toISOString()
      }));
      console.log('📤 Message sent:', messageText);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [connected, roomId, username]);

  return {
    connected,
    messages,
    sendMessage,
    setMessages // Allow loading history
  };
};


