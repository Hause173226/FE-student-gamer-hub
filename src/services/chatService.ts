import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { 
  ChatMessage, 
  ChatHistoryResponse, 
  ConnectionState, 
  ChatEvents,
  getRoomChannel,
  getDmChannel
} from '../types/chat';
import { API_CONFIG } from '../config/apiConfig';

export class ChatService {
  private connection: HubConnection | null = null;
  private events: Partial<ChatEvents> = {};
  private currentChannels: Set<string> = new Set();

  constructor() {
    this.setupConnection();
  }

  private setupConnection(): void {
    // Connection will be created when connect() is called
  }

  /**
   * Connect to SignalR ChatHub
   */
  async connect(token: string): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      console.log('✅ ChatService already connected');
      return;
    }

    const hubUrl = `${API_CONFIG.STUDENT_GAMER_HUB_URL}/ws/chat`;
    console.log('🔄 Connecting to ChatHub...');
    console.log('🔗 Hub URL:', hubUrl);
    console.log('🔑 Token length:', token?.length || 0);
    console.log('🌐 API Base URL:', API_CONFIG.STUDENT_GAMER_HUB_URL);

    try {
      this.connection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => {
            console.log('🔑 Using token for connection:', token?.substring(0, 20) + '...');
            return token;
          },
          skipNegotiation: false, // Allow negotiation for fallback
          // Remove transport restriction to allow all transports
          withCredentials: false, // Disable credentials to avoid CORS issues
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(2) // Debug level for more info
        .build();

      this.setupEventHandlers();
      
      await this.connection.start();
      console.log('✅ Connected to ChatHub');
      
      this.events.onConnectionStateChanged?.(ConnectionState.Connected);
    } catch (error) {
      console.error('❌ Failed to connect to ChatHub:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      
      // Try to provide more specific error info
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          console.error('🚨 CORS or Network Error: Backend might not be running or CORS not configured');
          console.error('💡 Check if backend is running on:', API_CONFIG.STUDENT_GAMER_HUB_URL);
        } else if (error.message.includes('negotiation')) {
          console.error('🚨 SignalR Negotiation Error: Check SignalR configuration in backend');
        }
      }
      
      this.events.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Disconnect from SignalR
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      console.log('🔄 Disconnecting from ChatHub...');
      await this.connection.stop();
      this.connection = null;
      this.currentChannels.clear();
      this.events.onConnectionStateChanged?.(ConnectionState.Disconnected);
      console.log('✅ Disconnected from ChatHub');
    }
  }

  /**
   * Send message to a room
   */
  async sendRoomMessage(roomId: string, text: string): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error('Not connected to chat server');
    }

    if (!text.trim()) {
      throw new Error('Message cannot be empty');
    }

    try {
      const channel = getRoomChannel(roomId);
      console.log(`📤 Sending message to room ${roomId}:`, text);
      
      await this.connection.invoke('SendMessage', channel, text.trim());
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Failed to send room message:', error);
      this.events.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Send DM message
   */
  async sendDmMessage(toUserId: string, text: string): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error('Not connected to chat server');
    }

    if (!text.trim()) {
      throw new Error('Message cannot be empty');
    }

    try {
      const channel = getDmChannel('current-user', toUserId); // Will be replaced with actual current user ID
      console.log(`📤 Sending DM to ${toUserId}:`, text);
      
      await this.connection.invoke('SendMessage', channel, text.trim());
      console.log('✅ DM sent successfully');
    } catch (error) {
      console.error('❌ Failed to send DM:', error);
      this.events.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Load chat history for a room
   */
  async loadRoomHistory(roomId: string, afterId?: string, take: number = 50): Promise<ChatMessage[]> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error('Not connected to chat server');
    }

    try {
      const channel = getRoomChannel(roomId);
      console.log(`📥 Loading history for room ${roomId}...`);
      
      await this.connection.invoke('LoadHistory', channel, afterId, take);
      
      // History will be received via 'history' event
      return new Promise((resolve) => {
        const handler = (response: ChatHistoryResponse) => {
          if (response.channel === channel) {
            this.connection?.off('history', handler);
            console.log(`✅ Loaded ${response.items.length} messages for room ${roomId}`);
            resolve(response.items);
          }
        };
        this.connection?.on('history', handler);
      });
    } catch (error) {
      console.error('❌ Failed to load room history:', error);
      this.events.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Join multiple channels at once
   */
  async joinChannels(channels: string[]): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      throw new Error('Not connected to chat server');
    }

    try {
      console.log('🔄 Joining channels:', channels);
      await this.connection.invoke('JoinChannels', channels);
      
      channels.forEach(channel => this.currentChannels.add(channel));
      console.log('✅ Joined channels successfully');
    } catch (error) {
      console.error('❌ Failed to join channels:', error);
      this.events.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Join a single room
   */
  async joinRoom(roomId: string): Promise<void> {
    const channel = getRoomChannel(roomId);
    await this.joinChannels([channel]);
  }

  /**
   * Leave a channel
   */
  async leaveChannel(channel: string): Promise<void> {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      return;
    }

    try {
      console.log(`🔄 Leaving channel: ${channel}`);
      await this.connection.invoke('LeaveChannel', channel);
      this.currentChannels.delete(channel);
      console.log('✅ Left channel successfully');
    } catch (error) {
      console.error('❌ Failed to leave channel:', error);
      this.events.onError?.(error as Error);
    }
  }

  /**
   * Setup event handlers for SignalR events
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Message received
    this.connection.on('msg', (message: ChatMessage) => {
      console.log('📨 Message received:', message);
      this.events.onMessageReceived?.(message);
    });

    // History loaded
    this.connection.on('history', (response: ChatHistoryResponse) => {
      console.log('📚 History loaded:', response);
      // This will be handled by the loadRoomHistory promise
    });

    // User joined
    this.connection.on('userJoined', (userId: string, channel: string) => {
      console.log(`👤 User ${userId} joined channel ${channel}`);
      this.events.onUserJoined?.(userId, channel);
    });

    // User left
    this.connection.on('userLeft', (userId: string, channel: string) => {
      console.log(`👋 User ${userId} left channel ${channel}`);
      this.events.onUserLeft?.(userId, channel);
    });

    // User typing
    this.connection.on('userTyping', (userId: string, channel: string, isTyping: boolean) => {
      console.log(`⌨️ User ${userId} ${isTyping ? 'started' : 'stopped'} typing in ${channel}`);
      this.events.onUserTyping?.(userId, channel, isTyping);
    });

    // Connection state changes
    this.connection.onreconnecting((error) => {
      console.log('🔄 Reconnecting to ChatHub...', error?.message);
      this.events.onConnectionStateChanged?.(ConnectionState.Reconnecting);
    });

    this.connection.onreconnected((connectionId) => {
      console.log('✅ Reconnected to ChatHub:', connectionId);
      this.events.onConnectionStateChanged?.(ConnectionState.Connected);
    });

    this.connection.onclose((error) => {
      console.log('❌ Connection closed:', error?.message);
      this.events.onConnectionStateChanged?.(ConnectionState.Disconnected);
      this.events.onError?.(error || new Error('Connection closed'));
    });
  }

  /**
   * Register event handlers
   */
  onMessageReceived(callback: (message: ChatMessage) => void): void {
    this.events.onMessageReceived = callback;
  }

  onUserJoined(callback: (userId: string, channel: string) => void): void {
    this.events.onUserJoined = callback;
  }

  onUserLeft(callback: (userId: string, channel: string) => void): void {
    this.events.onUserLeft = callback;
  }

  onUserTyping(callback: (userId: string, channel: string, isTyping: boolean) => void): void {
    this.events.onUserTyping = callback;
  }

  onConnectionStateChanged(callback: (state: ConnectionState) => void): void {
    this.events.onConnectionStateChanged = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.events.onError = callback;
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    if (!this.connection) return ConnectionState.Disconnected;
    
    switch (this.connection.state) {
      case HubConnectionState.Disconnected:
        return ConnectionState.Disconnected;
      case HubConnectionState.Connecting:
        return ConnectionState.Connecting;
      case HubConnectionState.Connected:
        return ConnectionState.Connected;
      case HubConnectionState.Reconnecting:
        return ConnectionState.Reconnecting;
      default:
        return ConnectionState.Disconnected;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection?.state === HubConnectionState.Connected;
  }

  /**
   * Get current channels
   */
  getCurrentChannels(): string[] {
    return Array.from(this.currentChannels);
  }
}

// Singleton instance
export const chatService = new ChatService();
export default chatService;
