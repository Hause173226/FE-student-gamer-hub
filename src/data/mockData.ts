// Mock data cho toàn bộ hệ thống
export interface MockCommunity {
  id: number;
  name: string;
  description: string;
  category: string;
  membersCount: number;
  isPublic: boolean;
  school?: string;
  avatar: string;
  color: string;
  createdAt: string;
}

export interface MockGroup {
  id: number;
  communityId: number;
  name: string;
  description: string;
  membersCount: number;
  isJoined: boolean;
  avatar: string;
  color: string;
  createdAt: string;
}

export interface MockChatRoom {
  id: number;
  groupId: number;
  name: string;
  description: string;
  membersCount: number;
  isJoined: boolean;
  avatar: string;
  color: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  createdAt: string;
}

export interface MockMessage {
  id: number;
  roomId: number;
  userId: number;
  username: string;
  message: string;
  timestamp: string;
  avatar: string;
}

// Mock Communities Data
export const mockCommunities: MockCommunity[] = [
  {
    id: 1,
    name: "Chơi Game",
    description: "Cộng đồng game thủ - Nơi kết nối các game thủ trong trường",
    category: "Gaming",
    membersCount: 1247,
    isPublic: true,
    school: "FPT University",
    avatar: "🎮",
    color: "from-blue-500 to-indigo-600",
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Học Bài",
    description: "Cộng đồng học tập - Chia sẻ kiến thức và hỗ trợ học tập",
    category: "Education",
    membersCount: 856,
    isPublic: true,
    school: "HCMUT",
    avatar: "📚",
    color: "from-emerald-500 to-teal-600",
    createdAt: "2024-01-10"
  },
  {
    id: 3,
    name: "Thể Thao",
    description: "Cộng đồng thể thao - Tổ chức các hoạt động thể thao",
    category: "Sports",
    membersCount: 423,
    isPublic: true,
    school: "UEH",
    avatar: "⚽",
    color: "from-orange-500 to-red-600",
    createdAt: "2024-01-08"
  },
  {
    id: 4,
    name: "Âm Nhạc",
    description: "Cộng đồng âm nhạc - Chia sẻ và thảo luận về âm nhạc",
    category: "Music",
    membersCount: 234,
    isPublic: true,
    school: "VNU",
    avatar: "🎵",
    color: "from-purple-500 to-pink-600",
    createdAt: "2024-01-05"
  },
  {
    id: 5,
    name: "Công Nghệ",
    description: "Cộng đồng công nghệ - Thảo luận về công nghệ mới",
    category: "Technology",
    membersCount: 567,
    isPublic: true,
    school: "UIT",
    avatar: "💻",
    color: "from-cyan-500 to-blue-600",
    createdAt: "2024-01-12"
  }
];

// Mock Groups Data
export const mockGroups: MockGroup[] = [
  // Groups cho Community "Chơi Game"
  {
    id: 1,
    communityId: 1,
    name: "Valorant Team 1",
    description: "Team Valorant chuyên nghiệp - Tìm kiếm đồng đội rank",
    membersCount: 24,
    isJoined: false,
    avatar: "🔫",
    color: "from-red-500 to-pink-600",
    createdAt: "2024-01-20"
  },
  {
    id: 2,
    communityId: 1,
    name: "Valorant Team 2",
    description: "Team Valorant casual - Chơi vui vẻ không áp lực",
    membersCount: 18,
    isJoined: true,
    avatar: "🎯",
    color: "from-blue-500 to-cyan-600",
    createdAt: "2024-01-18"
  },
  {
    id: 3,
    communityId: 1,
    name: "League of Legends",
    description: "Cộng đồng LOL - Tổ chức các giải đấu và sự kiện",
    membersCount: 45,
    isJoined: false,
    avatar: "⚔️",
    color: "from-yellow-500 to-orange-600",
    createdAt: "2024-01-16"
  },
  {
    id: 4,
    communityId: 1,
    name: "Mobile Legends",
    description: "Cộng đồng MLBB - Chơi Mobile Legends cùng nhau",
    membersCount: 32,
    isJoined: true,
    avatar: "📱",
    color: "from-green-500 to-emerald-600",
    createdAt: "2024-01-14"
  },
  // Groups cho Community "Học Bài"
  {
    id: 5,
    communityId: 2,
    name: "Toán Cao Cấp",
    description: "Nhóm học Toán Cao Cấp - Hỗ trợ nhau trong học tập",
    membersCount: 28,
    isJoined: false,
    avatar: "📐",
    color: "from-indigo-500 to-purple-600",
    createdAt: "2024-01-19"
  },
  {
    id: 6,
    communityId: 2,
    name: "Lập Trình",
    description: "Nhóm lập trình - Chia sẻ code và kinh nghiệm",
    membersCount: 35,
    isJoined: true,
    avatar: "💻",
    color: "from-cyan-500 to-blue-600",
    createdAt: "2024-01-17"
  }
];

// Mock Chat Rooms Data
export const mockChatRooms: MockChatRoom[] = [
  // Rooms cho Group "Valorant Team 2"
  {
    id: 1,
    groupId: 2,
    name: "general-chat",
    description: "Phòng chat chung của team",
    membersCount: 18,
    isJoined: true,
    avatar: "💬",
    color: "from-blue-500 to-cyan-600",
    lastMessage: "Ai đi rank không?",
    lastMessageTime: "2 phút trước",
    unreadCount: 3,
    createdAt: "2024-01-20"
  },
  {
    id: 2,
    groupId: 2,
    name: "ranked-team",
    description: "Tìm đồng đội chơi rank",
    membersCount: 8,
    isJoined: true,
    avatar: "🏆",
    color: "from-yellow-500 to-orange-600",
    lastMessage: "Team 5v5 cần 2 người",
    lastMessageTime: "5 phút trước",
    unreadCount: 1,
    createdAt: "2024-01-20"
  },
  {
    id: 3,
    groupId: 2,
    name: "voice-chat",
    description: "Phòng voice chat",
    membersCount: 4,
    isJoined: true,
    avatar: "🎤",
    color: "from-purple-500 to-pink-600",
    lastMessage: "Đang có 4 người online",
    lastMessageTime: "1 phút trước",
    unreadCount: 0,
    createdAt: "2024-01-20"
  },
  {
    id: 7,
    groupId: 2,
    name: "voice-gaming",
    description: "Voice channel cho gaming",
    membersCount: 6,
    isJoined: true,
    avatar: "🎮",
    color: "from-green-500 to-emerald-600",
    lastMessage: "Đang chơi Valorant",
    lastMessageTime: "5 phút trước",
    unreadCount: 0,
    createdAt: "2024-01-20"
  },
  // Rooms cho Group "Mobile Legends"
  {
    id: 4,
    groupId: 4,
    name: "mlbb-general",
    description: "Chat chung Mobile Legends",
    membersCount: 32,
    isJoined: true,
    avatar: "📱",
    color: "from-green-500 to-emerald-600",
    lastMessage: "Scrim tối nay 8h",
    lastMessageTime: "10 phút trước",
    unreadCount: 5,
    createdAt: "2024-01-19"
  },
  {
    id: 5,
    groupId: 4,
    name: "tournament",
    description: "Thông tin giải đấu",
    membersCount: 15,
    isJoined: true,
    avatar: "🏆",
    color: "from-red-500 to-pink-600",
    lastMessage: "Đăng ký giải đấu mới",
    lastMessageTime: "30 phút trước",
    unreadCount: 2,
    createdAt: "2024-01-19"
  },
  // Rooms cho Group "Lập Trình"
  {
    id: 6,
    groupId: 6,
    name: "code-sharing",
    description: "Chia sẻ code và project",
    membersCount: 35,
    isJoined: true,
    avatar: "💻",
    color: "from-cyan-500 to-blue-600",
    lastMessage: "Ai có code React hook không?",
    lastMessageTime: "1 giờ trước",
    unreadCount: 7,
    createdAt: "2024-01-18"
  }
];

// Mock Messages Data
export const mockMessages: MockMessage[] = [
  {
    id: 1,
    roomId: 1,
    userId: 1,
    username: "Tuấn Anh",
    message: "Chào mọi người! Ai đi rank không?",
    timestamp: "2024-01-20T14:30:00Z",
    avatar: "TA"
  },
  {
    id: 2,
    roomId: 1,
    userId: 2,
    username: "Thùy Linh",
    message: "Mình vào nha! Rank gì vậy?",
    timestamp: "2024-01-20T14:32:00Z",
    avatar: "TL"
  },
  {
    id: 3,
    roomId: 1,
    userId: 3,
    username: "Đức Minh",
    message: "Team cần 2 người nữa, ai join không?",
    timestamp: "2024-01-20T14:35:00Z",
    avatar: "DM"
  },
  {
    id: 4,
    roomId: 2,
    userId: 4,
    username: "Minh Tuấn",
    message: "Team 5v5 cần 2 người, rank Gold trở lên",
    timestamp: "2024-01-20T14:40:00Z",
    avatar: "MT"
  },
  {
    id: 5,
    roomId: 4,
    userId: 5,
    username: "Hương Lan",
    message: "Scrim tối nay 8h, ai tham gia không?",
    timestamp: "2024-01-20T15:00:00Z",
    avatar: "HL"
  }
];

// Helper functions
export const getCommunities = () => mockCommunities;
export const getGroupsByCommunityId = (communityId: number) => 
  mockGroups.filter(group => group.communityId === communityId);
export const getChatRoomsByGroupId = (groupId: number) => 
  mockChatRooms.filter(room => room.groupId === groupId);
export const getMessagesByRoomId = (roomId: number) => 
  mockMessages.filter(message => message.roomId === roomId);

// Join/Leave functions
export const joinGroup = (groupId: number) => {
  const group = mockGroups.find(g => g.id === groupId);
  if (group) {
    group.isJoined = true;
    group.membersCount += 1;
  }
};

export const leaveGroup = (groupId: number) => {
  const group = mockGroups.find(g => g.id === groupId);
  if (group) {
    group.isJoined = false;
    group.membersCount -= 1;
  }
};

export const joinChatRoom = (roomId: number) => {
  const room = mockChatRooms.find(r => r.id === roomId);
  if (room) {
    room.isJoined = true;
    room.membersCount += 1;
  }
};

export const leaveChatRoom = (roomId: number) => {
  const room = mockChatRooms.find(r => r.id === roomId);
  if (room) {
    room.isJoined = false;
    room.membersCount -= 1;
  }
};
