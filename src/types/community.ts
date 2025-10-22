// Community types based on backend CommunityDTO
export interface CommunityDTO {
  Id: string;
  Name: string;
  Description?: string;
  School?: string;
  IsPublic: boolean;
  MembersCount: number;
  ClubCount?: number;
  EventCount?: number;
  GameDTO?: GameDTO[];
  OwnerId?: string;
  IsMember?: boolean;
  IsOwner?: boolean;
  CreatedAtUtc?: string;
  UpdatedAtUtc?: string;
}

export interface GameDTO {
  id: number;
  name: string;
}

// Frontend Community interface (extended from backend)
export interface Community {
  id: string | number; // Can be string GUID or number
  name: string;
  description: string;
  school: string;
  isPublic: boolean;
  membersCount: number;
  clubCount: number;
  eventCount: number;
  games: GameDTO[];
  // Additional frontend properties
  avatar?: string;
  color?: string;
  verified?: boolean;
  role?: 'Admin' | 'Moderator' | 'Member';
  lastActivity?: string;
  unreadMessages?: number;
  trending?: boolean;
  category?: string;
  createdAt?: string;
}

// API Response types
export interface CommunityListResponse {
  Items: CommunityDTO[];
  NextCursor: string | null;
  PrevCursor: string | null;
  Size: number;
  Sort: string;
  Desc: boolean;
}

export interface CommunityResponse {
  data: CommunityDTO;
  success: boolean;
  message?: string;
}
