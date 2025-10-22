// Room types based on backend RoomDTO
export interface RoomDTO {
  Id: string;
  ClubId: string;
  Name: string;
  Description?: string;
  JoinPolicy: RoomJoinPolicy;
  Capacity?: number;
  MembersCount: number;
  OwnerId: string;
  IsMember: boolean;
  IsOwner: boolean;
  MembershipStatus?: RoomMemberStatus;
  CreatedAtUtc: string;
  UpdatedAtUtc?: string;
}

export enum RoomJoinPolicy {
  Open = 'Open',
  RequiresApproval = 'RequiresApproval',
  RequiresPassword = 'RequiresPassword'
}

export enum RoomMemberStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export enum RoomRole {
  Owner = 'Owner',
  Moderator = 'Moderator',
  Member = 'Member'
}

// Frontend Room interface (extended from backend)
export interface Room {
  id: string | number; // Can be string GUID or number
  clubId: string | number;
  name: string;
  description: string;
  joinPolicy: RoomJoinPolicy;
  capacity?: number;
  membersCount: number;
  // Additional frontend properties
  avatar?: string;
  color?: string;
  isJoined?: boolean;
  createdAt?: string;
  isOwner?: boolean;
  isMember?: boolean;
  membershipStatus?: RoomMemberStatus;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

// Room Member types
export interface RoomMemberDTO {
  userId: number;
  userName: string;
  userAvatarUrl: string;
  roomId: number;
  roomName: string;
  role: RoomRole;
  status: RoomMemberStatus;
  joinedAt: string;
}

export interface RoomJoinRequestDTO {
  password?: string;
}

// API Response types
export interface RoomListResponse {
  data: RoomDTO[];
  success: boolean;
  message?: string;
}

export interface RoomResponse {
  data: RoomDTO;
  success: boolean;
  message?: string;
}
