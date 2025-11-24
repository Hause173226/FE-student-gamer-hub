import { useState, useEffect, useCallback, useRef } from "react";
import {
  signalRChatService,
  ConnectionStatus,
} from "../services/signalRChatService";
import { ChatMessageDto, HistoryResponse } from "../types/chat";

export interface ChatMessage {
  id: string;
  channel: string;
  fromUserId: string;
  toUserId?: string;
  roomId?: string;
  text: string;
  sentAt: string;
}

export function useSignalRChannel(channel: string, currentUserId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!channel || !currentUserId) {
      return;
    }

    if (isInitialized.current) {
      return;
    }

    isInitialized.current = true;
    let isMounted = true;

    setMessages([]);
    setIsLoading(true);

    // ✅ 1. Listen for connection changes
    const unsubConnection = signalRChatService.onConnectionChange(
      (status: ConnectionStatus) => {
        if (isMounted) {
          setIsConnected(status === "connected");
        }
      }
    );

    // ✅ 2. Listen for REALTIME messages
    const unsubMessage = signalRChatService.onMessage((msg: ChatMessageDto) => {
      if (!isMounted || msg.channel !== channel) return;

      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg as ChatMessage];
      });
    });

    // ✅ 3. QUAN TRỌNG: Listen for HISTORY messages
    const unsubHistory = signalRChatService.onHistory(
      (response: HistoryResponse) => {
        if (!isMounted) return;
        setIsLoading(false);

        // ✅ Backend trả về "items", không phải "messages"
        if (
          !response.items ||
          !Array.isArray(response.items) ||
          response.items.length === 0
        ) {
          return;
        }

        // Filter messages for this channel only (nếu backend trả về mixed channels)
        const channelMessages = response.channel
          ? response.items.filter((m) => m.channel === channel)
          : response.items;

        if (channelMessages.length === 0) {
          return;
        }

        // Sort by time (oldest first)
        const sorted = [...channelMessages].sort(
          (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );

        setMessages(sorted as ChatMessage[]);
      }
    );

    // ✅ 4. Initialize
    (async () => {
      try {
        await signalRChatService.connect();
        await signalRChatService.joinChannel(channel);

        // Load history - backend sẽ gửi về qua event "history"
        await signalRChatService.loadHistory(channel, undefined, 100);
      } catch (error) {
        console.error("❌ Init error:", error);
        setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
      isInitialized.current = false;
      unsubConnection();
      unsubMessage();
      unsubHistory();
    };
  }, [channel, currentUserId]);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || !isConnected) {
        throw new Error("Cannot send");
      }

      if (channel.startsWith("dm:")) {
        const parts = channel.replace("dm:", "").split("_");
        const otherUserId = parts.find((id) => id !== currentUserId);
        await signalRChatService.sendDm(otherUserId!, text);
      } else if (channel.startsWith("room:")) {
        const roomId = channel.replace("room:", "");
        await signalRChatService.sendToRoom(roomId, text);
      }
    },
    [channel, currentUserId, isConnected]
  );

  return {
    messages,
    isConnected,
    isLoading,
    send,
  };
}
