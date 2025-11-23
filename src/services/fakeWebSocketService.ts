// Fake WebSocket service để sync real-time giữa browsers
interface ChatMessage {
  id: string;
  roomId: number;
  userId: number;
  username: string;
  message: string;
  timestamp: string;
  avatar: string;
}

interface WebSocketMessage {
  type: 'message' | 'join' | 'leave';
  data: any;
  roomId: number;
  userId: number;
}

class FakeWebSocketService {
  private listeners: Map<string, ((message: WebSocketMessage) => void)[]> = new Map();
  private isConnected = false;
  private reconnectInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.connect();
    this.setupStorageListener();
  }

  private connect() {
    console.log('🔌 Fake WebSocket connecting...');
    this.isConnected = true;
    
    // Simulate connection delay
    setTimeout(() => {
      console.log('✅ Fake WebSocket connected');
      this.startHeartbeat();
    }, 100);
  }

  private startHeartbeat() {
    // Simulate heartbeat every 30 seconds
    setInterval(() => {
      if (this.isConnected) {
        console.log('💓 WebSocket heartbeat');
      }
    }, 30000);
  }

  private setupStorageListener() {
    // Listen for localStorage changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'chat_messages' && e.newValue) {
        try {
          const messages = JSON.parse(e.newValue);
          const latestMessage = messages[messages.length - 1];
          
          if (latestMessage && latestMessage.username !== 'Anonymous' && latestMessage.username !== 'User') {
            const wsMessage: WebSocketMessage = {
              type: 'message',
              data: latestMessage,
              roomId: latestMessage.roomId,
              userId: latestMessage.userId
            };
            
            console.log('📨 Received message from storage:', latestMessage);
            this.notifyListeners('message', wsMessage);
          }
        } catch (error) {
          console.error('Error parsing storage message:', error);
        }
      }
    });

    // Polling mechanism for cross-browser sync
    this.startPolling();
  }

  private startPolling() {
    let lastMessageCount = 0;
    
    setInterval(() => {
      try {
        const messages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
        
        if (messages.length > lastMessageCount) {
          const newMessages = messages.slice(lastMessageCount);
          
          newMessages.forEach((message: ChatMessage) => {
            if (message.username !== 'Anonymous' && message.username !== 'User') {
              const wsMessage: WebSocketMessage = {
                type: 'message',
                data: message,
                roomId: message.roomId,
                userId: message.userId
              };
              
              console.log('📨 Received message from polling:', message);
              this.notifyListeners('message', wsMessage);
            }
          });
          
          lastMessageCount = messages.length;
        }
      } catch (error) {
        console.error('Error in polling:', error);
      }
    }, 1000); // Check every 1 second
  }

  public subscribe(event: string, callback: (message: WebSocketMessage) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    
    console.log(`📡 Subscribed to ${event}`);
  }

  public unsubscribe(event: string, callback: (message: WebSocketMessage) => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private notifyListeners(event: string, message: WebSocketMessage) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('Error in WebSocket callback:', error);
        }
      });
    }
  }

  public sendMessage(message: ChatMessage) {
    if (!this.isConnected) {
      console.warn('⚠️ WebSocket not connected');
      return;
    }

    // Store message in localStorage (this will trigger storage event)
    const storedMessages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
    storedMessages.push(message);
    localStorage.setItem('chat_messages', JSON.stringify(storedMessages));

    // Also notify current tab immediately
    const wsMessage: WebSocketMessage = {
      type: 'message',
      data: message,
      roomId: message.roomId,
      userId: message.userId
    };

    this.notifyListeners('message', wsMessage);
    
    console.log('📤 Message sent via fake WebSocket:', message);
    
    // Force trigger storage event for cross-browser sync
    setTimeout(() => {
      const event = new StorageEvent('storage', {
        key: 'chat_messages',
        newValue: JSON.stringify(storedMessages),
        oldValue: JSON.stringify(storedMessages.slice(0, -1)),
        url: window.location.href,
        storageArea: localStorage
      });
      window.dispatchEvent(event);
    }, 100);
  }

  public joinRoom(roomId: number, userId: number) {
    const wsMessage: WebSocketMessage = {
      type: 'join',
      data: { roomId, userId },
      roomId,
      userId
    };

    this.notifyListeners('join', wsMessage);
    console.log(`🚪 User ${userId} joined room ${roomId}`);
  }

  public leaveRoom(roomId: number, userId: number) {
    const wsMessage: WebSocketMessage = {
      type: 'leave',
      data: { roomId, userId },
      roomId,
      userId
    };

    this.notifyListeners('leave', wsMessage);
    console.log(`🚪 User ${userId} left room ${roomId}`);
  }

  public disconnect() {
    this.isConnected = false;
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }
    console.log('🔌 Fake WebSocket disconnected');
  }

  public getConnectionState() {
    return this.isConnected;
  }
}

// Export singleton instance
export const fakeWebSocketService = new FakeWebSocketService();
export default fakeWebSocketService;
