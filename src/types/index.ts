export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  university: string;
  level: number;
  xp: number;
  role: "admin" | "moderator" | "member";
  status: "online" | "offline" | "away" | "busy";
  isPlaying?: boolean;
}

export interface Community {
  id: string;
  name: string;
  members: number;
  university: string;
  verified: boolean;
  role?: "Admin" | "Moderator" | "Member";
  lastActivity: string;
  avatar: string;
  color: string;
  unreadMessages?: number;
  description?: string;
  trending?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  organizer: string;
  participants: number;
  maxParticipants: number;
  prize: string;
  status: "Đang đăng ký" | "Còn chỗ" | "Đầy" | "Đã kết thúc";
  image?: string;
  tags: string[];
  isRegistered: boolean;
  featured: boolean;
}

export interface GameStats {
  game: string;
  rank: string;
  winRate: string;
  matches: number;
  hours: number;
  icon: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: any;
  color: string;
  earned: boolean;
}

export interface Match {
  id: number;
  game: string;
  result: "Thắng" | "Thua";
  rank: string;
  time: string;
  duration: string;
  placement?: string;
}

export interface Message {
  id: number;
  user: {
    name: string;
    avatar: string;
    role: "admin" | "moderator" | "member";
  };
  content: string;
  timestamp: string;
  reactions: Array<{
    emoji: string;
    count: number;
  }>;
}

export interface Room {
  id: string;
  name: string;
  type: "text" | "voice";
  members: number;
  maxMembers?: number;
  hasVoice?: boolean;
}

export interface RoomCategory {
  id: string;
  name: string;
  rooms: Room[];
}

export interface Mission {
  id: number;
  title: string;
  progress: number;
  total: number;
  xp: number;
  completed: boolean;
}

export type ViewType =
  | "dashboard"
  | "communities"
  | "friends"
  | "rooms"
  | "events"
  | "profile";
