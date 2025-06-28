import React, { useState } from 'react';
import { Mic, MicOff, Headphones, Headphones as HeadphonesOff, Settings, UserPlus, Crown, Shield, Volume2, VolumeX, Phone, PhoneOff, Users, Hash, Plus, Search, Filter, MoreVertical, Send, Smile, Paperclip, Image, MessageSquare, Gamepad2, Star, MapPin, Clock } from 'lucide-react';

export function Rooms() {
  const [selectedRoom, setSelectedRoom] = useState('fpt-lol-general');
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isInVoice, setIsInVoice] = useState(false);
  const [message, setMessage] = useState('');

  const roomCategories = [
    {
      id: 'fpt-university',
      name: 'FPT University',
      rooms: [
        { id: 'fpt-lol-general', name: 'lol-general', type: 'text', members: 24, hasVoice: true },
        { id: 'fpt-valorant', name: 'valorant-ranked', type: 'text', members: 18, hasVoice: true },
        { id: 'fpt-dota2', name: 'dota2-chill', type: 'text', members: 12, hasVoice: true },
        { id: 'fpt-random', name: 'random-chat', type: 'text', members: 31, hasVoice: false },
      ]
    },
    {
      id: 'hcmut',
      name: 'HCMUT',
      rooms: [
        { id: 'hcmut-general', name: 'general', type: 'text', members: 45, hasVoice: false },
        { id: 'hcmut-valorant', name: 'valorant-team', type: 'text', members: 8, hasVoice: true },
        { id: 'hcmut-mobile-legends', name: 'mobile-legends', type: 'text', members: 15, hasVoice: true },
      ]
    },
    {
      id: 'voice-channels',
      name: 'Voice Channels',
      rooms: [
        { id: 'voice-1', name: 'General Hangout', type: 'voice', members: 3, maxMembers: 8 },
        { id: 'voice-2', name: 'Ranked Team', type: 'voice', members: 5, maxMembers: 5 },
        { id: 'voice-3', name: 'Chill Zone', type: 'voice', members: 2, maxMembers: 10 },
      ]
    }
  ];

  const voiceUsers = [
    { id: 1, name: 'Tuấn Anh', avatar: 'TA', university: 'FPT', isMuted: false, isSpeaking: true, role: 'admin' },
    { id: 2, name: 'Thùy Linh', avatar: 'TL', university: 'FPT', isMuted: true, isSpeaking: false, role: 'member' },
    { id: 3, name: 'Đức Minh', avatar: 'DM', university: 'HCMUT', isMuted: false, isSpeaking: false, role: 'member' },
  ];

  const messages = [
    {
      id: 1,
      user: { name: 'Tuấn Anh', avatar: 'TA', role: 'admin' },
      content: 'Ai muốn duo rank Valorant không? Mình đang Plat 2 📈',
      timestamp: '14:30',
      reactions: [{ emoji: '🎯', count: 3 }]
    },
    {
      id: 2,
      user: { name: 'Thùy Linh', avatar: 'TL', role: 'member' },
      content: 'Mình vào nha! Main Sage, có thể flex support khác 🌸',
      timestamp: '14:32',
      reactions: [{ emoji: '✨', count: 2 }]
    },
    {
      id: 3,
      user: { name: 'Minh Khang', avatar: 'MK', role: 'member' },
      content: 'Có ai biết lịch thi đấu VCT không? Muốn xem T1 vs DRX 🔥',
      timestamp: '14:35',
      reactions: []
    },
    {
      id: 4,
      user: { name: 'Thu Hà', avatar: 'TH', role: 'moderator' },
      content: 'Check pinned message nhé! Mình đã update lịch thi đấu tuần này rồi 📌',
      timestamp: '14:36',
      reactions: [{ emoji: '👍', count: 5 }]
    }
  ];

  const currentRoom = roomCategories
    .flatMap(cat => cat.rooms)
    .find(room => room.id === selectedRoom);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // Handle message send
      setMessage('');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-3 h-3 text-yellow-400" />;
      case 'moderator': return <Shield className="w-3 h-3 text-blue-400" />;
      default: return null;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-yellow-400';
      case 'moderator': return 'text-blue-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Server Sidebar */}
      <div className="hidden lg:flex w-64 bg-gray-800 border-r border-gray-700 flex-col">
        {/* Server Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white">Gaming Rooms</h2>
              <p className="text-xs text-gray-400">247 members online</p>
            </div>
          </div>
        </div>

        {/* Room Categories */}
        <div className="flex-1 overflow-y-auto p-2">
          {roomCategories.map((category) => (
            <div key={category.id} className="mb-4">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                {category.name}
              </h3>
              <div className="space-y-1">
                {category.rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded text-left transition-colors group ${
                      selectedRoom === room.id
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-750'
                    }`}
                  >
                    {room.type === 'text' ? (
                      <Hash className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <Volume2 className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium truncate">{room.name}</span>
                    {room.hasVoice && room.type === 'text' && (
                      <Users className="w-3 h-3 text-gray-500" />
                    )}
                    <span className="text-xs text-gray-500 ml-auto">
                      {room.type === 'voice' ? `${room.members}/${room.maxMembers}` : room.members}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Voice Status */}
        {isInVoice && (
          <div className="border-t border-gray-700 p-3">
            <div className="bg-gray-750 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Voice Connected</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">General Hangout</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-md text-xs font-medium transition-colors ${
                    isMuted
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                  }`}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsDeafened(!isDeafened)}
                  className={`flex-1 flex items-center justify-center space-x-1 py-2 rounded-md text-xs font-medium transition-colors ${
                    isDeafened
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                  }`}
                >
                  {isDeafened ? <HeadphonesOff className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsInVoice(false)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-md transition-colors"
                >
                  <PhoneOff className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Status */}
        <div className="border-t border-gray-700 p-3">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">MN</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-gray-800"></div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Minh Nguyễn</p>
              <p className="text-xs text-emerald-400">Online</p>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Hash className="w-5 h-5 text-gray-400" />
              <h1 className="font-semibold text-white">
                {currentRoom?.name || 'lol-general'}
              </h1>
              <div className="hidden lg:block w-px h-4 bg-gray-600"></div>
              <p className="hidden lg:block text-sm text-gray-400">
                Thảo luận về League of Legends - Rank cùng nhau! 🎮
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                <UserPlus className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="group hover:bg-gray-800/50 px-4 py-2 rounded-lg transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold">{msg.user.avatar}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-gray-800"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`font-medium ${getRoleColor(msg.user.role)}`}>
                        {msg.user.name}
                      </span>
                      {getRoleIcon(msg.user.role)}
                      <span className="text-xs text-gray-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-gray-200 text-sm leading-relaxed">{msg.content}</p>
                    {msg.reactions.length > 0 && (
                      <div className="flex items-center space-x-1 mt-2">
                        {msg.reactions.map((reaction, index) => (
                          <button
                            key={index}
                            className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded-lg text-xs transition-colors"
                          >
                            <span>{reaction.emoji}</span>
                            <span className="text-gray-300">{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Input */}
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
                <Image className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Nhắn tin tại #${currentRoom?.name || 'lol-general'}...`}
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
      </div>

      {/* Members Sidebar */}
      <div className="hidden xl:flex w-60 bg-gray-800 border-l border-gray-700 flex-col">
        {/* Voice Channel Members */}
        {isInVoice && (
          <div className="border-b border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Voice Channel — {voiceUsers.length}
            </h3>
            <div className="space-y-2">
              {voiceUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-750 transition-colors">
                  <div className="relative">
                    <div className={`w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center ${
                      user.isSpeaking ? 'ring-2 ring-emerald-400' : ''
                    }`}>
                      <span className="text-sm font-bold">{user.avatar}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-gray-800"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-1">
                      <span className={`text-sm font-medium ${getRoleColor(user.role)}`}>
                        {user.name}
                      </span>
                      {getRoleIcon(user.role)}
                    </div>
                    <p className="text-xs text-gray-400">{user.university}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {user.isMuted && <MicOff className="w-3 h-3 text-red-400" />}
                    {user.isSpeaking && <Volume2 className="w-3 h-3 text-emerald-400" />}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsInVoice(false)}
              className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Join Voice Channel
            </button>
          </div>
        )}

        {/* Online Members */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Online — {currentRoom?.members || 24}
          </h3>
          <div className="space-y-1">
            {[
              { name: 'Tuấn Anh', avatar: 'TA', status: 'Đang chơi LoL', role: 'admin', university: 'FPT' },
              { name: 'Thùy Linh', avatar: 'TL', status: 'Listening to music', role: 'member', university: 'FPT' },
              { name: 'Đức Minh', avatar: 'DM', status: 'Idle', role: 'member', university: 'HCMUT' },
              { name: 'Thu Hà', avatar: 'TH', status: 'Đang stream', role: 'moderator', university: 'UEH' },
              { name: 'Văn Khang', avatar: 'VK', status: 'Online', role: 'member', university: 'FPT' },
            ].map((member, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">{member.avatar}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-gray-800"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className={`text-sm font-medium ${getRoleColor(member.role)} truncate`}>
                      {member.name}
                    </span>
                    {getRoleIcon(member.role)}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{member.status}</p>
                  <p className="text-xs text-gray-500">{member.university}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}