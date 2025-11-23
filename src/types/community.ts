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

// Cursor-based pagination (for search)
export interface CursorPageResult<T> {
  Items: T[];
  NextCursor: string | null;
  PrevCursor: string | null;
  Size: number;
  Sort: string;
  Desc: boolean;
}

// Offset-based pagination (for discover)
export interface PagedResult<T> {
  Items: T[];
  Page: number;
  Size: number;
  TotalCount: number;
  TotalPages: number;
  HasPrevious: boolean;
  HasNext: boolean;
  Sort: string;
  Desc: boolean;
}

// Community Member types
export interface CommunityMemberDto {
  UserId: string;
  UserName: string;
  FullName?: string;
  Email?: string;
  Avatar?: string;
  Role: 'Owner' | 'Moderator' | 'Member';
  JoinedAt: string;
  IsCurrentUser?: boolean;
}

export interface OffsetPage<T> {
  Items: T[];
  Page: number;
  Size: number;
  TotalCount: number;
  TotalPages: number;
  HasPrevious: boolean;
  HasNext: boolean;
  Sort: string;
  Desc: boolean;
}

export interface CommunityResponse {
  data: CommunityDTO;
  success: boolean;
  message?: string;
}

// Search filters
export interface CommunitySearchFilters {
  school?: string;
  gameId?: string;
  isPublic?: boolean;
  membersFrom?: number;
  membersTo?: number;
  cursor?: string;
  size?: number;
}

// Discover filters
export interface CommunityDiscoverFilters {
  query?: string;
  offset?: number;
  limit?: number;
  orderBy?: 'trending' | 'newest';
}
