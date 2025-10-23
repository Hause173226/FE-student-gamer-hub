// Chat message structure based on Redis backend
export interface ChatMessage {
  id: string;           // Redis Stream message ID
  channel: string;      // "room:xxx" or "dm:xxx_xxx"
  fromUserId: string;
  toUserId?: string;    // null for room messages
  roomId?: string;      // null for DM messages
  text: string;
  sentAt: string;       // ISO timestamp
}

// Chat history response from backend
export interface ChatHistoryResponse {
  channel: string;
  items: ChatMessage[];
  nextAfterId?: string; // For pagination
}

// User presence in chat
export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  isTyping?: boolean;
  lastSeen?: string;
}

// Chat room information
export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  isJoined: boolean;
  isOwner: boolean;
}

// SignalR connection states
export enum ConnectionState {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting', 
  Connected = 'Connected',
  Reconnecting = 'Reconnecting'
}

// Message types for different chat features
export enum MessageType {
  Text = 'text',
  Image = 'image',
  File = 'file',
  System = 'system',
  Join = 'join',
  Leave = 'leave'
}

// Message status for delivery tracking
export enum MessageStatus {
  Sending = 'sending',
  Sent = 'sent',
  Delivered = 'delivered',
  Failed = 'failed'
}

// Enhanced message with frontend properties
export interface EnhancedChatMessage extends ChatMessage {
  type: MessageType;
  status: MessageStatus;
  isOwn: boolean;
  user?: ChatUser;
  timestamp: Date;
  formattedTime: string;
}

// Chat service events
export interface ChatEvents {
  onMessageReceived: (message: ChatMessage) => void;
  onUserJoined: (userId: string, channel: string) => void;
  onUserLeft: (userId: string, channel: string) => void;
  onUserTyping: (userId: string, channel: string, isTyping: boolean) => void;
  onConnectionStateChanged: (state: ConnectionState) => void;
  onError: (error: Error) => void;
}

// Channel helpers
export const getRoomChannel = (roomId: string): string => `room:${roomId}`;
export const getDmChannel = (userId1: string, userId2: string): string => {
  const [min, max] = [userId1, userId2].sort();
  return `dm:${min}_${max}`;
};

// Parse channel to get room ID
export const parseRoomChannel = (channel: string): string | null => {
  const match = channel.match(/^room:(.+)$/);
  return match ? match[1] : null;
};

// Parse channel to get DM user IDs
export const parseDmChannel = (channel: string): [string, string] | null => {
  const match = channel.match(/^dm:(.+)_(.+)$/);
  return match ? [match[1], match[2]] : null;
};
