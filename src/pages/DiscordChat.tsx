import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Settings, Send, Smile, Paperclip, 
  Image as ImageIcon, Loader2, Mic, MicOff, Volume2, VolumeX,
  Crown, Shield, Plus, Hash as HashIcon, Volume2 as VoiceIcon, Video
} from 'lucide-react';
import { getChatRoomsByGroupId, MockChatRoom } from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';
import { fakeWebSocketService } from '../services/fakeWebSocketService';
import { VideoCall } from '../components/VideoCall';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: string;
  roomId: number;
  userId: number;
  username: string;
  message: string;
  timestamp: string;
  avatar: string;
}

export function DiscordChat() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Fallback user object to prevent errors
  const safeUser = user || { id: '1', name: 'Guest', avatar: '👤' };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [group, setGroup] = useState<any>(null);
  const [channels, setChannels] = useState<MockChatRoom[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<MockChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);

  useEffect(() => {
    // Clear all old messages for fresh start
    localStorage.removeItem('chat_messages');
    localStorage.removeItem('test_user');
    setMessages([]);
    loadGroupAndChannels();
  }, [groupId]);

  // WebSocket setup for real-time sync
  useEffect(() => {
    if (!safeUser || !selectedChannel) return;

    // Join room
    fakeWebSocketService.joinRoom(selectedChannel.id, Number(safeUser.id));

    // Subscribe to messages
    const handleMessage = (wsMessage: any) => {
      if (wsMessage.type === 'message' && wsMessage.roomId === selectedChannel.id) {
        const newMessage = wsMessage.data;
        
        // Check if message already exists to avoid duplicates
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (!exists) {
            return [...prev, newMessage];
          }
          return prev;
        });

        // Auto scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    };

    fakeWebSocketService.subscribe('message', handleMessage);

    // Cleanup on unmount or channel change
    return () => {
      fakeWebSocketService.unsubscribe('message', handleMessage);
      fakeWebSocketService.leaveRoom(selectedChannel.id, Number(safeUser.id));
    };
  }, [safeUser, selectedChannel]);

  // Load messages when selectedChannel changes
  useEffect(() => {
    if (selectedChannel) {
      loadMessages(selectedChannel.id);
    }
  }, [selectedChannel]);

  const loadGroupAndChannels = async () => {
    if (!groupId) return;
    
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get channels from mock data
      const channelsData = getChatRoomsByGroupId(Number(groupId));
      setChannels(channelsData);
      
      // Set group info (mock)
      const groupNames: { [key: string]: string } = {
        '1': 'Valorant Team 1',
        '2': 'Valorant Team 2', 
        '3': 'Valorant Team 3',
        '4': 'Mobile Legends',
        '5': 'Mobile Legends Team 2'
      };
      
      setGroup({
        id: Number(groupId),
        name: groupNames[groupId || '1'] || 'Unknown Group',
        membersCount: 18
      });
      
      // Select first channel by default
      if (channelsData.length > 0) {
        setSelectedChannel(channelsData[0]);
        loadMessages(channelsData[0].id);
      }
      
      console.log('✅ Loaded channels:', channelsData);
    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast.error('Không thể tải dữ liệu nhóm');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (channelId: number) => {
    try {
      // Load messages from localStorage - siêu tốc
      const storedMessages = getStoredMessages(channelId);
      setMessages(storedMessages);
      console.log('✅ Loaded messages for channel:', channelId, storedMessages);
      
      // Scroll to bottom after loading - siêu tốc
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 1);
    } catch (error) {
      console.error('❌ Error loading messages:', error);
    }
  };

  const getStoredMessages = (roomId: number): ChatMessage[] => {
    try {
      const storedMessages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
      return storedMessages.filter((msg: ChatMessage) => 
        msg.roomId === roomId && 
        msg.username !== 'Anonymous' && 
        msg.username !== 'User' &&
        msg.username !== 'Anonymous User'
      );
    } catch (error) {
      console.error('Error getting stored messages:', error);
      return [];
    }
  };


  const handleChannelSelect = (channel: MockChatRoom) => {
    setSelectedChannel(channel);
    
    // If it's a voice channel, start voice call (no video, no mic, no screen share)
    if (channel.name.includes('voice')) {
      startVideoCall(); // Voice call only
    } else {
      loadMessages(channel.id);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !safeUser || !selectedChannel) return;

    // Create new message with better ID
    const newMessage: ChatMessage = {
      id: `msg_${selectedChannel.id}_${Date.now()}_${safeUser.id}`,
      roomId: selectedChannel.id,
      userId: Number(safeUser.id),
      username: safeUser.fullName || safeUser.userName || safeUser.name || 'User',
      message: message.trim(),
      timestamp: new Date().toISOString(),
      avatar: (safeUser.fullName || safeUser.userName || safeUser.name || 'U').substring(0, 2).toUpperCase()
    };
    
    // Send via WebSocket (this will sync to all browsers)
    fakeWebSocketService.sendMessage(newMessage);
    
    // Clear input
    setMessage('');
    
    console.log('📤 Message sent via WebSocket:', newMessage);
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getRoleIcon = (username: string) => {
    if (username.toLowerCase().includes('admin')) {
      return <Crown className="w-3 h-3 text-yellow-400" />;
    }
    if (username.toLowerCase().includes('mod')) {
      return <Shield className="w-3 h-3 text-blue-400" />;
    }
    return null;
  };

  const startVideoCall = () => {
    if (!user || !selectedChannel) {
      toast.error('Không thể bắt đầu video call');
      return;
    }
    
    setIsVideoCallActive(true);
    toast.success('Đang khởi tạo video call...');
  };

  const endVideoCall = () => {
    setIsVideoCallActive(false);
    toast.success('Đã kết thúc video call');
  };

  if (loading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Đang tải nhóm...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Không tìm thấy nhóm</p>
          <button
            onClick={() => navigate(-1)}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Server Sidebar */}
      <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4">
        <button
          onClick={() => navigate(-1)}
          className="p-3 hover:bg-gray-700 rounded-lg transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
          <span className="text-lg font-bold">{group.name.substring(0, 2)}</span>
        </div>
        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold">1</span>
        </div>
      </div>

      {/* Channels Sidebar */}
      <div className="w-60 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Server Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="font-bold text-white">{group.name}</h2>
          <p className="text-xs text-gray-400">1 online</p>
        </div>

        {/* Text Channels */}
        <div className="flex-1 p-2">
          <div className="mb-4">
            <div className="flex items-center justify-between px-2 py-1 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Text Channels
              </span>
              <button className="text-gray-400 hover:text-white">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {channels.filter(ch => !ch.name.includes('voice')).map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelSelect(channel)}
                  className={`w-full flex items-center space-x-2 px-2 py-1 rounded text-left transition-colors ${
                    selectedChannel?.id === channel.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <HashIcon className="w-4 h-4" />
                  <span className="text-sm">{channel.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Channels */}
          <div>
            <div className="flex items-center justify-between px-2 py-1 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Voice Channels
              </span>
              <button className="text-gray-400 hover:text-white">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              {channels.filter(ch => ch.name.includes('voice')).map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelSelect(channel)}
                  className={`w-full flex items-center space-x-2 px-2 py-1 rounded text-left transition-colors ${
                    selectedChannel?.id === channel.id
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <VoiceIcon className="w-4 h-4" />
                  <span className="text-sm">{channel.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">
                {(user?.fullName || user?.userName || 'U').substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                {user?.fullName || user?.userName || 'User'}
              </p>
              <p className="text-xs text-gray-400">Online</p>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-1 rounded transition-colors ${
                  isMuted ? 'bg-red-600 text-white' : 'hover:bg-gray-700 text-gray-400'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsDeafened(!isDeafened)}
                className={`p-1 rounded transition-colors ${
                  isDeafened ? 'bg-red-600 text-white' : 'hover:bg-gray-700 text-gray-400'
                }`}
              >
                {isDeafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button className="p-1 hover:bg-gray-700 text-gray-400 rounded transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        {selectedChannel && (
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {selectedChannel.name.includes('voice') ? (
                  <VoiceIcon className="w-5 h-5 text-gray-400" />
                ) : (
                  <HashIcon className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <h1 className="font-semibold text-white">{selectedChannel.name}</h1>
                  <p className="text-xs text-gray-400">{selectedChannel.description}</p>
                </div>
              </div>
              {!selectedChannel.name.includes('voice') && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={startVideoCall}
                    className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    <span className="text-sm">Video Call</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedChannel && (
            <>
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <HashIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Chưa có tin nhắn nào</p>
                    <p className="text-gray-500 text-sm mt-1">Hãy là người đầu tiên chat!</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMyMessage = safeUser && msg.userId === Number(safeUser.id);
                  
                  return (
                    <div key={index} className={`group hover:bg-gray-800/50 px-4 py-2 rounded-lg transition-colors ${
                      isMyMessage ? 'flex justify-start' : 'flex justify-end'
                    }`}>
                      <div className={`flex items-start space-x-3 max-w-[70%] ${
                        isMyMessage ? '' : 'flex-row-reverse space-x-reverse'
                      }`}>
                        <div className="relative flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isMyMessage 
                              ? 'bg-gradient-to-r from-emerald-500 to-green-600' 
                              : 'bg-gradient-to-r from-gray-600 to-gray-700'
                          }`}>
                            <span className="text-sm font-bold">{msg.avatar}</span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-gray-900"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`flex items-center space-x-2 mb-1 ${
                            isMyMessage ? 'justify-start' : 'justify-end'
                          }`}>
                            <span className="font-medium text-white">{msg.username}</span>
                            {getRoleIcon(msg.username)}
                            <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                          </div>
                          <div className={`rounded-lg px-3 py-2 ${
                            isMyMessage 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-gray-700 text-gray-200'
                          }`}>
                            <p className="text-sm leading-relaxed break-words">{msg.message}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        {selectedChannel && !selectedChannel.name.includes('voice') && (
          <div className="bg-gray-800 border-t border-gray-700 p-4">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Nhắn tin tại #${selectedChannel.name}...`}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:text-gray-400 text-white p-2 rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Voice Channel UI */}
        {selectedChannel && selectedChannel.name.includes('voice') && (
          <div className="bg-gray-800 border-t border-gray-700 p-4">
            <div className="text-center">
              <VoiceIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Voice Channel</h3>
              <p className="text-gray-400 mb-4">Bạn đang trong voice channel</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isMuted ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button
                  onClick={() => setIsDeafened(!isDeafened)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDeafened ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {isDeafened ? 'Undeafen' : 'Deafen'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Call Component */}
      {isVideoCallActive && (
        <VideoCall
          roomId={selectedChannel?.id?.toString() || '1'}
          userId={safeUser.id?.toString() || '1'}
          onEndCall={endVideoCall}
        />
      )}
    </div>
  );
}