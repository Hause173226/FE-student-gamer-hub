// Community types based on backend CommunityDTO
export interface CommunityDTO {
  id: number;
  name: string;
  description: string;
  school: string;
  isPublic: boolean;
  membersCount: number;
  clubCount: number;
  eventCount: number;
  gameDTO: GameDTO[];
}

export interface GameDTO {
  id: number;
  name: string;
}

// Frontend Community interface (extended from backend)
export interface Community {
  id: number;
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
  data: CommunityDTO[];
  success: boolean;
  message?: string;
}

export interface CommunityResponse {
  data: CommunityDTO;
  success: boolean;
  message?: string;
}
