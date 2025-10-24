import { useEffect, useState, useCallback } from 'react';
import { ConnectionState } from '../types/chat';
import { chatService } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';

export const useChat = () => {
  const { user, token } = useAuth();
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect to chat service
  const connect = useCallback(async () => {
    if (!token || connectionState === ConnectionState.Connected) return;

    try {
      console.log('🔄 useChat: Attempting to connect...');
      console.log('🔑 Token available:', !!token);
      console.log('👤 User available:', !!user);
      
      setIsConnecting(true);
      setError(null);
      await chatService.connect(token);
    } catch (err) {
      console.error('❌ useChat: Failed to connect to chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to chat');
    } finally {
      setIsConnecting(false);
    }
  }, [token, connectionState, user]);

  // Disconnect from chat service
  const disconnect = useCallback(async () => {
    try {
      await chatService.disconnect();
    } catch (err) {
      console.error('Failed to disconnect from chat:', err);
    }
  }, []);

  // Setup event handlers
  useEffect(() => {
    chatService.onConnectionStateChanged(setConnectionState);
    chatService.onError((err) => {
      console.error('Chat error:', err);
      setError(err.message);
    });

    return () => {
      // Cleanup handled by service singleton
    };
  }, []);

  // Auto connect when user is authenticated
  useEffect(() => {
    console.log('🔄 useChat: Auto-connect check:', {
      hasUser: !!user,
      hasToken: !!token,
      connectionState,
      shouldConnect: user && token && connectionState === ConnectionState.Disconnected
    });
    
    if (user && token && connectionState === ConnectionState.Disconnected) {
      console.log('🚀 useChat: Auto-connecting...');
      connect();
    }
  }, [user, token, connectionState, connect]);

  // Auto disconnect when user logs out
  useEffect(() => {
    if (!user) {
      disconnect();
    }
  }, [user, disconnect]);

  return {
    connectionState,
    isConnecting,
    error,
    connect,
    disconnect,
    isConnected: connectionState === ConnectionState.Connected
  };
};
