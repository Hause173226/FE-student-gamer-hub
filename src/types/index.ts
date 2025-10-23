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

export interface Community {
  id: string;
  name: string;
  description: string | null;
  school: string | null;
  isPublic: boolean;
  membersCount: number;
  clubsCount: number; // Bạn có thể đổi tên này nếu cần
  ownerId: string;
  isMember: boolean;
  isOwner: boolean;
  createdAtUtc: string;
  updatedAtUtc: string | null;
}
export interface CreateCommunityPayload {
  name: string;
  description: string | null;
  school: string | null;
  isPublic: boolean;
}
// src/types/index.ts

/**
 * Type cho dữ liệu tóm tắt của một community khi hiển thị trong danh sách.
 */
export interface CommunitySummary {
  id: string;
  name: string;
  school: string | null;
  isPublic: boolean;
  membersCount: number;
}

/**
 * Type cho cấu trúc response trả về từ API lấy danh sách community (có phân trang).
 */
export interface CommunityListResponse {
  Items: CommunitySummary[];
  nextCursor: string | null;
  prevCursor: string | null;
  size: number;
  sort: string;
  desc: boolean;
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
  | "profile"
    | "clubs";



/**
 * Type cho cấu trúc response trả về từ API lấy danh sách club (có phân trang).
 */
export interface ClubListResponse {
  Items: ClubSummary[];
  NextCursor: string | null;
  PrevCursor: string | null;
  Size: number;
  Sort: string;
  Desc: boolean;
}
// Dữ liệu gửi khi tạo club mới
export interface CreateClubPayload {
  communityId: string;
  name: string;
  description?: string | null;
  isPublic: boolean;
}

// Dữ liệu trả về sau khi tạo hoặc lấy club
export interface ClubSummary {
  Id: string;
  CommunityId: string;
  Name: string;
  Description?: string | null;
  IsPublic: boolean;
  MembersCount: number;
  RoomsCount: number;
  OwnerId: string;
  IsMember: boolean;
  IsOwner: boolean;
  CreatedAtUtc: string;
  UpdatedAtUtc?: string | null;
}

