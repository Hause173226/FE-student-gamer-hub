// Club types based on backend ClubDTO
export interface ClubDTO {
  Id: string;
  CommunityId: string;
  Name: string;
  Description?: string;
  IsPublic: boolean;
  MembersCount: number;
  RoomsCount?: number;
  OwnerId?: string;
  IsMember?: boolean;
  IsOwner?: boolean;
  CreatedAtUtc?: string;
  UpdatedAtUtc?: string;
}

// Frontend Club interface (extended from backend)
export interface Club {
  id: string | number; // Can be string GUID or number
  name: string;
  description: string;
  isPublic: boolean;
  membersCount: number;
  // Additional frontend properties
  communityId?: string | number; // Can be string GUID or number
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
  isOwner?: boolean; // Added for owner check
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
  Items: ClubDTO[];
  NextCursor: string | null;
  PrevCursor: string | null;
  Size: number;
  Sort: string;
  Desc: boolean;
}

export interface ClubResponse {
  data: ClubDTO;
  success: boolean;
  message?: string;
}
