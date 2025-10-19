// Club types based on backend ClubDTO
export interface ClubDTO {
  name: string;
  description: string;
  isPublic: boolean;
  membersCount: number;
}

// Frontend Club interface (extended from backend)
export interface Club {
  id: number;
  name: string;
  description: string;
  isPublic: boolean;
  membersCount: number;
  // Additional frontend properties
  communityId?: number;
  avatar?: string;
  color?: string;
  verified?: boolean;
  role?: 'Admin' | 'Moderator' | 'Member';
  lastActivity?: string;
  unreadMessages?: number;
  trending?: boolean;
  category?: string;
  createdAt?: string;
  isJoined?: boolean;
}

// Club Member types
export interface ClubMemberDTO {
  userId: number;
  userName: string;
  userAvatarUrl: string;
  clubId: number;
  clubName: string;
  joinedAt: string;
}

export interface JoinClubDTO {
  userId: number;
}

// API Response types
export interface ClubListResponse {
  data: ClubDTO[];
  success: boolean;
  message?: string;
}

export interface ClubResponse {
  data: ClubDTO;
  success: boolean;
  message?: string;
}
