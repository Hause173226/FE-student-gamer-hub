/**
 * React Hook for SignalR Chat
 *
 * Manages SignalR connection, messages, and chat history
 * Provides easy-to-use interface for chat functionality
 *
 * Usage:
 * ```tsx
 * const {
 *   messages,
 *   sendMessage,
 *   loadHistory,
 *   connectionStatus,
 *   error
 * } = useSignalRChat({
 *   channel: 'room:123'
 * });
 * ```
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  signalRChatService,
  SignalRChatService,
  ConnectionStatus,
  ChatError,
  RateLimitError,
} from "../services/signalRChatService";
import { ChatMessageDto, HistoryResponse } from "../types/chat";

export interface UseSignalRChatOptions {
  /** Channel to join (e.g., "room:123" or "dm:user1_user2") */
  channel?: string;

  /** Auto-connect on mount (default: true) */
  autoConnect?: boolean;

  /** Auto-join channel on connection (default: true) */
  autoJoinChannel?: boolean;

  /** Auto-load history on join (default: true) */
  autoLoadHistory?: boolean;

  /** Number of messages to load in history (default: 50) */
  historyPageSize?: number;
}

export interface UseSignalRChatReturn {
  // State
  messages: ChatMessageDto[];
  connectionStatus: ConnectionStatus;
  error: ChatError | null;
  isConnected: boolean;
  isLoading: boolean;
  hasMoreHistory: boolean;

  // Actions
  sendMessage: (text: string) => Promise<void>;
  sendDm: (toUserId: string, text: string) => Promise<void>;
  sendToRoom: (roomId: string, text: string) => Promise<void>;
  loadHistory: (afterId?: string) => Promise<void>;
  loadMoreHistory: () => Promise<void>;
  joinChannel: (channel: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;

  // Connection
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

export function useSignalRChat(
  options: UseSignalRChatOptions = {}
): UseSignalRChatReturn {
  const {
    channel,
    autoConnect = true,
    autoJoinChannel = true,
    autoLoadHistory = true,
    historyPageSize = 50,
  } = options;

  // State
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<ChatError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [nextAfterId, setNextAfterId] = useState<string | undefined>();

  // Refs
  const currentChannel = useRef<string | undefined>(channel);
  const isInitialized = useRef(false);

  // ==================== CONNECTION MANAGEMENT ====================

  const connect = useCallback(async () => {
    try {
      setError(null);
      await signalRChatService.connect();
    } catch (err) {
      const chatError =
        err instanceof ChatError ? err : new ChatError("Failed to connect");
      setError(chatError);
      throw chatError;
    }
  }, []);

  const disconnect = useCallback(async () => {
    await signalRChatService.disconnect();
    setMessages([]);
    setHasMoreHistory(false);
    setNextAfterId(undefined);
  }, []);

  // ==================== CHANNEL MANAGEMENT ====================

  const joinChannel = useCallback(
    async (channelToJoin: string) => {
      try {
        setError(null);
        await signalRChatService.joinChannel(channelToJoin);
        currentChannel.current = channelToJoin;

        // Load history if auto-load is enabled
        if (autoLoadHistory) {
          await loadHistory();
        }
      } catch (err) {
        const chatError =
          err instanceof ChatError
            ? err
            : new ChatError("Failed to join channel");
        setError(chatError);
        throw chatError;
      }
    },
    [autoLoadHistory]
  );

  // ==================== MESSAGE SENDING ====================

  const sendMessage = useCallback(async (text: string) => {
    if (!currentChannel.current) {
      const err = new ChatError("No channel selected", "NO_CHANNEL");
      setError(err);
      throw err;
    }

    const channelInfo = SignalRChatService.parseChannel(currentChannel.current);
    if (!channelInfo) {
      const err = new ChatError("Invalid channel format", "INVALID_CHANNEL");
      setError(err);
      throw err;
    }

    try {
      setError(null);

      if (channelInfo.type === "dm") {
        // Extract target user ID from dm:userId1_userId2
        const parts = channelInfo.id.split("_");
        if (parts.length !== 2) {
          throw new ChatError("Invalid DM channel format", "INVALID_CHANNEL");
        }

        // Determine which user is the target (not current user)
        // This assumes you have current user ID - you may need to get it from AuthContext
        const toUserId = parts[1]; // Simplified - you should determine correct target
        await signalRChatService.sendDm(toUserId, text);
      } else {
        await signalRChatService.sendToRoom(channelInfo.id, text);
      }
    } catch (err) {
      if (err instanceof RateLimitError) {
        setError(err);
      } else if (err instanceof ChatError) {
        setError(err);
      } else {
        setError(new ChatError("Failed to send message"));
      }
      throw err;
    }
  }, []);

  const sendDm = useCallback(async (toUserId: string, text: string) => {
    try {
      setError(null);
      await signalRChatService.sendDm(toUserId, text);
    } catch (err) {
      const chatError =
        err instanceof ChatError ? err : new ChatError("Failed to send DM");
      setError(chatError);
      throw chatError;
    }
  }, []);

  const sendToRoom = useCallback(async (roomId: string, text: string) => {
    try {
      setError(null);
      await signalRChatService.sendToRoom(roomId, text);
    } catch (err) {
      const chatError =
        err instanceof ChatError
          ? err
          : new ChatError("Failed to send message");
      setError(chatError);
      throw chatError;
    }
  }, []);

  // ==================== HISTORY LOADING ====================

  const loadHistory = useCallback(
    async (afterId?: string) => {
      if (!currentChannel.current) {
        console.warn("No channel to load history for");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        await signalRChatService.loadHistory(
          currentChannel.current,
          afterId,
          historyPageSize
        );
        // Response will come via history listener
      } catch (err) {
        const chatError =
          err instanceof ChatError
            ? err
            : new ChatError("Failed to load history");
        setError(chatError);
        throw chatError;
      } finally {
        setIsLoading(false);
      }
    },
    [historyPageSize]
  );

  const loadMoreHistory = useCallback(async () => {
    if (!hasMoreHistory || !nextAfterId) {
      console.log("No more history to load");
      return;
    }

    await loadHistory(nextAfterId);
  }, [hasMoreHistory, nextAfterId, loadHistory]);

  // ==================== UTILITY ====================

  const clearMessages = useCallback(() => {
    setMessages([]);
    setHasMoreHistory(false);
    setNextAfterId(undefined);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ==================== EVENT LISTENERS ====================

  useEffect(() => {
    // Listen for new messages
    const unsubscribeMessage = signalRChatService.onMessage((message) => {
      // Only add messages for current channel
      if (
        currentChannel.current &&
        message.channel === currentChannel.current
      ) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
    });

    // Listen for history responses
    const unsubscribeHistory = signalRChatService.onHistory(
      (response: HistoryResponse) => {
        setMessages((prev) => {
          // Merge with existing messages, avoiding duplicates
          const existingIds = new Set(prev.map((m) => m.id));
          const newMessages = response.items.filter(
            (m) => !existingIds.has(m.id)
          );

          // Prepend history messages (they're older)
          return [...newMessages, ...prev];
        });

        // Backend trả về nextAfterId, không có hasMore
        setHasMoreHistory(!!response.nextAfterId);
        setNextAfterId(response.nextAfterId || undefined);
      }
    );

    // Listen for connection changes
    const unsubscribeConnection = signalRChatService.onConnectionChange(
      (status) => {
        setConnectionStatus(status);
      }
    );

    // Listen for errors
    const unsubscribeError = signalRChatService.onError((err) => {
      setError(err);
    });

    return () => {
      unsubscribeMessage();
      unsubscribeHistory();
      unsubscribeConnection();
      unsubscribeError();
    };
  }, []);

  // ==================== INITIALIZATION ====================

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initialize = async () => {
      try {
        // Auto-connect if enabled
        if (autoConnect) {
          await connect();
        }

        // Auto-join channel if provided and auto-join is enabled
        if (channel && autoJoinChannel && signalRChatService.isConnected()) {
          await joinChannel(channel);
        }
      } catch (err) {
        console.error("Failed to initialize SignalR chat:", err);
      }
    };

    initialize();

    // Cleanup on unmount
    return () => {
      // Don't disconnect on unmount - keep connection alive
      // Only clear local state
    };
  }, [autoConnect, channel, autoJoinChannel, connect, joinChannel]);

  // Update channel when it changes
  useEffect(() => {
    if (
      channel &&
      channel !== currentChannel.current &&
      signalRChatService.isConnected()
    ) {
      clearMessages();
      joinChannel(channel);
    }
  }, [channel, joinChannel, clearMessages]);

  // ==================== RETURN ====================

  return {
    // State
    messages,
    connectionStatus,
    error,
    isConnected: connectionStatus === "connected",
    isLoading,
    hasMoreHistory,

    // Actions
    sendMessage,
    sendDm,
    sendToRoom,
    loadHistory,
    loadMoreHistory,
    joinChannel,
    clearMessages,
    clearError,

    // Connection
    connect,
    disconnect,
  };
}

// ==================== HELPER HOOKS ====================

/**
 * Hook for DM chat with a specific user
 */
export function useDmChat(
  targetUserId: string | undefined,
  currentUserId: string | undefined
) {
  const channel =
    targetUserId && currentUserId
      ? SignalRChatService.getDmChannel(currentUserId, targetUserId)
      : undefined;

  const chat = useSignalRChat({
    channel,
    autoConnect: true,
    autoJoinChannel: !!channel,
    autoLoadHistory: true,
  });

  const sendMessage = useCallback(
    async (text: string) => {
      if (!targetUserId) {
        throw new ChatError("No target user specified", "NO_TARGET");
      }
      return chat.sendDm(targetUserId, text);
    },
    [targetUserId, chat]
  );

  return {
    ...chat,
    sendMessage,
    targetUserId,
  };
}

/**
 * Hook for room chat
 */
export function useRoomChat(roomId: string | undefined) {
  const channel = roomId
    ? SignalRChatService.getRoomChannel(roomId)
    : undefined;

  const chat = useSignalRChat({
    channel,
    autoConnect: true,
    autoJoinChannel: !!channel,
    autoLoadHistory: true,
  });

  const sendMessage = useCallback(
    async (text: string) => {
      if (!roomId) {
        throw new ChatError("No room specified", "NO_ROOM");
      }
      return chat.sendToRoom(roomId, text);
    },
    [roomId, chat]
  );

  return {
    ...chat,
    sendMessage,
    roomId,
  };
}
