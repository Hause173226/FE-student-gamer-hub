/**
 * SignalR Chat Service - Optimized for ChatHub Backend
 *
 * Backend: https://student-gamer-hub.onrender.com/ws/chat
 * Hub: ChatHub (sealed class, [Authorize] required)
 * Auth: JWT Bearer Token from localStorage
 *
 * Hub Methods:
 * - SendDm(toUserId: Guid, text: string)
 * - SendToRoom(roomId: Guid, text: string)
 * - LoadHistory(channel: string, afterId?: string, take?: int)
 * - JoinChannels(channels: string[])
 *
 * Client Events:
 * - "msg" -> ChatMessageDto
 * - "history" -> HistoryResponse
 */

import {
  HubConnection,
  HubConnectionBuilder,
  HttpTransportType,
  LogLevel,
  HubConnectionState,
} from "@microsoft/signalr";
import { API_CONFIG } from "../config/apiConfig";
import { ChatMessageDto, HistoryResponse } from "../types/chat";

// Error types
export class ChatError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "ChatError";
  }
}

export class RateLimitError extends ChatError {
  constructor() {
    super("Message rate limit exceeded. Please wait a moment.", "RATE_LIMITED");
  }
}

// Connection state type
export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

// Event listener types
type MessageListener = (message: ChatMessageDto) => void;
type HistoryListener = (response: HistoryResponse) => void;
type ConnectionListener = (status: ConnectionStatus) => void;
type ErrorListener = (error: ChatError) => void;

export class SignalRChatService {
  private connection: HubConnection | null = null;
  private joinedChannels = new Set<string>();
  private reconnectAttempts = 0;

  // Event listeners
  private messageListeners = new Set<MessageListener>();
  private historyListeners = new Set<HistoryListener>();
  private connectionListeners = new Set<ConnectionListener>();
  private errorListeners = new Set<ErrorListener>();

  constructor() {
    this.buildConnection();
  }

  // ==================== CONNECTION MANAGEMENT ====================

  private buildConnection(): void {
    // Get token from localStorage
    const accessTokenFactory = async (): Promise<string> => {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new ChatError("No authentication token found", "NO_TOKEN");
      }
      return token;
    };

    // Custom retry delays: 0s, 2s, 5s, 10s, 30s, 60s
    const retryDelays = [0, 2000, 5000, 10000, 30000, 60000];

    this.connection = new HubConnectionBuilder()
      .withUrl(API_CONFIG.CHAT_HUB_URL, {
        accessTokenFactory,
        transport: HttpTransportType.WebSockets | HttpTransportType.LongPolling,
        skipNegotiation: false,
      })
      .withAutomaticReconnect(retryDelays)
      .configureLogging(LogLevel.Information)
      .build();

    this.setupEventHandlers();
    this.setupLifecycleHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Listen to "msg" event from server
    this.connection.on("msg", (message: ChatMessageDto) => {
      this.notifyMessageListeners(message);
    });

    // Listen to "history" event from server
    this.connection.on("history", (response: HistoryResponse) => {
      this.notifyHistoryListeners(response);
    });
  }

  private setupLifecycleHandlers(): void {
    if (!this.connection) return;

    this.connection.onreconnecting((error) => {
      console.warn("🔄 SignalR reconnecting...", error?.message);
      this.reconnectAttempts++;
      this.notifyConnectionListeners("reconnecting");
    });

    this.connection.onreconnected(async (connectionId) => {
      console.log("✅ SignalR reconnected:", connectionId);
      this.reconnectAttempts = 0;
      this.notifyConnectionListeners("connected");

      // Rejoin all channels after reconnection
      await this.rejoinChannels();
    });

    this.connection.onclose((error) => {
      console.error("❌ SignalR connection closed:", error?.message);
      this.notifyConnectionListeners("disconnected");

      if (error) {
        this.notifyErrorListeners(
          new ChatError(error.message || "Connection closed")
        );
      }
    });
  }

  async connect(): Promise<void> {
    if (!this.connection) {
      this.buildConnection();
    }

    if (this.connection?.state === HubConnectionState.Connected) {
      return;
    }

    try {
      this.notifyConnectionListeners("connecting");
      await this.connection!.start();
      this.notifyConnectionListeners("connected");
    } catch (error: any) {
      console.error("❌ Failed to connect:", error);
      this.notifyConnectionListeners("disconnected");
      throw new ChatError(
        error.message || "Failed to connect",
        "CONNECTION_FAILED"
      );
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.joinedChannels.clear();
      this.notifyConnectionListeners("disconnected");
    }
  }

  isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }

  getConnectionState(): ConnectionStatus {
    if (!this.connection) return "disconnected";

    switch (this.connection.state) {
      case HubConnectionState.Connected:
        return "connected";
      case HubConnectionState.Connecting:
        return "connecting";
      case HubConnectionState.Reconnecting:
        return "reconnecting";
      default:
        return "disconnected";
    }
  }

  // ==================== CHANNEL MANAGEMENT ====================

  /**
   * Join multiple channels at once (batch operation)
   * Validates each channel and adds connection to groups
   */
  async joinChannels(channels: string[]): Promise<void> {
    if (!this.connection) {
      throw new ChatError("Connection not initialized", "NOT_CONNECTED");
    }

    if (!channels || channels.length === 0) {
      throw new ChatError("Channels cannot be empty", "INVALID_CHANNELS");
    }

    try {
      console.log("📡 Invoking JoinChannels with:", channels);

      // Add timeout to prevent hanging forever
      const invokePromise = this.connection.invoke("JoinChannels", channels);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("JoinChannels timeout after 5s")),
          5000
        )
      );

      await Promise.race([invokePromise, timeoutPromise]);
      console.log("✅ JoinChannels succeeded for:", channels);
      channels.forEach((channel) => this.joinedChannels.add(channel));
    } catch (error: any) {
      console.error("❌ Failed to join channels:", error);
      throw this.parseError(error);
    }
  }

  /**
   * Join a room via dedicated hub method
   */
  async joinRoom(roomId: string): Promise<void> {
    if (!this.connection) {
      throw new ChatError("Connection not initialized", "NOT_CONNECTED");
    }

    if (!roomId || roomId.trim().length === 0) {
      throw new ChatError("Room ID is required", "INVALID_ROOM");
    }

    try {
      await this.connection.invoke("JoinRoom", roomId);
      const channel = SignalRChatService.getRoomChannel(roomId);
      this.joinedChannels.add(channel);
    } catch (error: any) {
      console.error("❌ Failed to join room:", error);
      throw this.parseError(error);
    }
  }

  /**
   * Leave a room via dedicated hub method
   */
  async leaveRoom(roomId: string): Promise<void> {
    if (!this.connection) {
      throw new ChatError("Connection not initialized", "NOT_CONNECTED");
    }

    if (!roomId || roomId.trim().length === 0) {
      throw new ChatError("Room ID is required", "INVALID_ROOM");
    }

    const channel = SignalRChatService.getRoomChannel(roomId);

    try {
      await this.connection.invoke("LeaveRoom", roomId);
      this.joinedChannels.delete(channel);
    } catch (error: any) {
      console.error("❌ Failed to leave room:", error);
      throw this.parseError(error);
    }
  }

  /**
   * Leave any joined channel
   */
  async leaveChannel(channel: string): Promise<void> {
    if (!this.connection) {
      throw new ChatError("Connection not initialized", "NOT_CONNECTED");
    }

    if (!channel || channel.trim().length === 0) {
      throw new ChatError("Channel is required", "INVALID_CHANNEL");
    }

    try {
      await this.connection.invoke("LeaveChannel", channel);
      this.joinedChannels.delete(channel);
    } catch (error: any) {
      console.error("❌ Failed to leave channel:", error);
      throw this.parseError(error);
    }
  }

  /**
   * Join a single channel
   */
  async joinChannel(channel: string): Promise<void> {
    return this.joinChannels([channel]);
  }

  /**
   * Rejoin all previously joined channels (used after reconnection)
   */
  private async rejoinChannels(): Promise<void> {
    if (this.joinedChannels.size === 0) return;

    const channels = Array.from(this.joinedChannels);
    try {
      await this.connection!.invoke("JoinChannels", channels);
    } catch (error) {
      console.error("❌ Failed to rejoin channels:", error);
    }
  }

  getJoinedChannels(): string[] {
    return Array.from(this.joinedChannels);
  }

  // ==================== MESSAGE SENDING ====================

  /**
   * Send DM to another user
   * Auto-joins both users to group "dm:{min}_{max}"
   *
   * @throws RateLimitError if rate limited
   * @throws ChatError if validation fails
   */
  async sendDm(toUserId: string, text: string): Promise<void> {
    if (!this.connection) {
      throw new ChatError("Connection not initialized", "NOT_CONNECTED");
    }

    if (!text || text.trim().length === 0) {
      throw new ChatError("Message text cannot be empty", "EMPTY_MESSAGE");
    }

    try {
      await this.invokeWithRetry("SendDm", toUserId, text);
    } catch (error: any) {
      console.error("❌ Failed to send DM:", error);
      throw this.parseError(error);
    }
  }

  /**
   * Send message to a room
   * Validates user has access to room
   * Auto-joins user to group "room:{roomId}"
   *
   * @throws RateLimitError if rate limited
   * @throws ChatError if validation fails
   */
  async sendToRoom(roomId: string, text: string): Promise<void> {
    if (!this.connection) {
      throw new ChatError("Connection not initialized", "NOT_CONNECTED");
    }

    if (!roomId || roomId.trim().length === 0) {
      throw new ChatError("Room ID is required", "INVALID_ROOM");
    }

    if (!text || text.trim().length === 0) {
      throw new ChatError("Message text cannot be empty", "EMPTY_MESSAGE");
    }

    try {
      await this.invokeWithRetry("SendToRoom", roomId, text);
    } catch (error: any) {
      console.error("❌ Failed to send to room:", error);
      throw this.parseError(error);
    }
  }

  // ==================== HISTORY LOADING ====================

  /**
   * Load chat history for a channel
   * Response is sent via "history" event
   *
   * @param channel - Channel identifier (e.g., "dm:xxx_yyy" or "room:xxx")
   * @param afterId - Load messages after this ID (for pagination)
   * @param take - Number of messages to fetch (default 50, max per backend config)
   */
  async loadHistory(
    channel: string,
    afterId?: string,
    take: number = 50
  ): Promise<void> {
    if (!this.connection) {
      throw new ChatError("Connection not initialized", "NOT_CONNECTED");
    }

    if (!channel || channel.trim().length === 0) {
      throw new ChatError("Channel is required", "INVALID_CHANNEL");
    }

    try {
      // Server will respond via "history" event
      await this.connection.invoke(
        "LoadHistory",
        channel,
        afterId || null,
        take
      );
      console.log(
        `📜 Loading history for channel: ${channel}, afterId: ${afterId}, take: ${take}`
      );
    } catch (error: any) {
      console.error("❌ Failed to load history:", error);
      throw this.parseError(error);
    }
  }

  // ==================== EVENT LISTENERS ====================

  onMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  onHistory(listener: HistoryListener): () => void {
    this.historyListeners.add(listener);
    return () => this.historyListeners.delete(listener);
  }

  onConnectionChange(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    // ✅ Immediately notify listener of current connection state
    const currentStatus = this.getConnectionState();
    listener(currentStatus);
    return () => this.connectionListeners.delete(listener);
  }

  onError(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  private notifyMessageListeners(message: ChatMessageDto): void {
    this.messageListeners.forEach((listener) => {
      try {
        listener(message);
      } catch (error) {
        console.error("Error in message listener:", error);
      }
    });
  }

  private notifyHistoryListeners(response: HistoryResponse): void {
    this.historyListeners.forEach((listener) => {
      try {
        listener(response);
      } catch (error) {
        console.error("Error in history listener:", error);
      }
    });
  }

  private notifyConnectionListeners(status: ConnectionStatus): void {
    this.connectionListeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.error("Error in connection listener:", error);
      }
    });
  }

  private notifyErrorListeners(error: ChatError): void {
    this.errorListeners.forEach((listener) => {
      try {
        listener(error);
      } catch (err) {
        console.error("Error in error listener:", err);
      }
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Invoke hub method with rate limit retry logic
   * Retries up to 3 times with exponential backoff
   */
  private async invokeWithRetry(
    methodName: string,
    ...args: any[]
  ): Promise<any> {
    const maxRetries = 3;
    let attempt = 0;
    let backoff = 500; // Initial delay: 500ms

    while (attempt <= maxRetries) {
      try {
        return await this.connection!.invoke(methodName, ...args);
      } catch (error: any) {
        const errorMsg = error?.message || error?.toString() || "";

        // Check if it's a rate limit error
        if (errorMsg.includes("rate_limited") && attempt < maxRetries) {
          attempt++;
          const delay =
            backoff * Math.pow(2, attempt - 1) + Math.random() * 100;
          console.warn(
            `⚠️ Rate limited, retrying in ${delay.toFixed(
              0
            )}ms (attempt ${attempt}/${maxRetries})`
          );
          await this.sleep(delay);
          continue;
        }

        throw error;
      }
    }
  }

  private parseError(error: any): ChatError {
    const errorMsg = error?.message || error?.toString() || "Unknown error";

    if (errorMsg.includes("rate_limited")) {
      return new RateLimitError();
    }

    if (errorMsg.includes("Cannot send a message to yourself")) {
      return new ChatError("Cannot send messages to yourself", "SELF_MESSAGE");
    }

    if (errorMsg.includes("Message text cannot be empty")) {
      return new ChatError("Message cannot be empty", "EMPTY_MESSAGE");
    }

    if (errorMsg.includes("Room id is required")) {
      return new ChatError("Room ID is required", "INVALID_ROOM");
    }

    if (errorMsg.includes("Channel is required")) {
      return new ChatError("Channel is required", "INVALID_CHANNEL");
    }

    return new ChatError(errorMsg, "UNKNOWN_ERROR");
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ==================== HELPER METHODS ====================

  /**
   * Generate DM channel ID from two user IDs
   * Format: "dm:{min}_{max}" where min/max are sorted GUIDs
   */
  static getDmChannel(userId1: string, userId2: string): string {
    const sorted = [userId1, userId2].sort();
    return `dm:${sorted[0]}_${sorted[1]}`;
  }

  /**
   * Generate Room channel ID from room ID
   * Format: "room:{roomId}"
   */
  static getRoomChannel(roomId: string): string {
    return `room:${roomId}`;
  }

  /**
   * Parse channel to get type and ID
   */
  static parseChannel(
    channel: string
  ): { type: "dm" | "room"; id: string } | null {
    if (channel.startsWith("dm:")) {
      return { type: "dm", id: channel.substring(3) };
    }
    if (channel.startsWith("room:")) {
      return { type: "room", id: channel.substring(5) };
    }
    return null;
  }
}

// Export singleton instance
export const signalRChatService = new SignalRChatService();
