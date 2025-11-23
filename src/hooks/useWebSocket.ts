import { useEffect, useRef, useState, useCallback } from 'react';
import { Client, Message } from '@stomp/stompjs';
import { ChatMessage } from '../services/platformGameService';
import { API_CONFIG } from '../config/apiConfig';

interface UseWebSocketProps {
  roomId: number;
  username: string;
  onMessageReceived?: (message: ChatMessage) => void;
}

export const useWebSocket = ({ roomId, username, onMessageReceived }: UseWebSocketProps) => {
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const clientRef = useRef<Client | null>(null);

  // Connect to WebSocket
  useEffect(() => {
    // Create STOMP client with native WebSocket
    const client = new Client({
      brokerURL: `ws://${API_CONFIG.PLATFORM_GAME_URL.replace('http://', '')}/ws/chat`,
      
      connectHeaders: {
        Authorization: `Basic ${btoa('admin:123456')}`
      },

      debug: (str) => {
        console.log('STOMP Debug:', str);
      },

      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      onConnect: () => {
        console.log('✅ WebSocket Connected to room:', roomId);
        setConnected(true);

        // Subscribe to room topic
        client.subscribe(`/topic/room/${roomId}`, (message: Message) => {
          try {
            const chatMessage: ChatMessage = JSON.parse(message.body);
            console.log('📨 Message received:', chatMessage);
            
            setMessages(prev => [...prev, chatMessage]);
            onMessageReceived?.(chatMessage);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });
      },

      onStompError: (frame) => {
        console.error('❌ STOMP Error:', frame.headers['message']);
        console.error('Details:', frame.body);
        setConnected(false);
      },

      onWebSocketClose: () => {
        console.log('🔌 WebSocket Disconnected');
        setConnected(false);
      }
    });

    client.activate();
    clientRef.current = client;

    // Cleanup on unmount
    return () => {
      if (clientRef.current) {
        console.log('🔌 Disconnecting WebSocket...');
        clientRef.current.deactivate();
      }
    };
  }, [roomId, onMessageReceived]);

  // Send message
  const sendMessage = useCallback((messageText: string, userId: number) => {
    if (!clientRef.current || !connected) {
      console.warn('⚠️ Cannot send message: WebSocket not connected');
      return;
    }

    const chatMessage: ChatMessage = {
      roomId,
      userId,
      username,
      message: messageText,
      timestamp: new Date().toISOString()
    };

    try {
      clientRef.current.publish({
        destination: '/app/chat/send',
        body: JSON.stringify(chatMessage)
      });
      console.log('📤 Message sent:', chatMessage);
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

