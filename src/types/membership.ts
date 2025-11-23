// ==================== API Response Types - REAL BACKEND ====================

// Membership Plan Response (GET /api/Memberships/public)
// Backend trả về PascalCase, không phải camelCase!
export interface MembershipPlanDto {
  Id: string;
  Name: string; // "Basic", "Pro", "Ultimate"
  Description: string | null;
  MonthlyEventLimit: number; // 3, 10, -1 (unlimited)
  Price: number; // VNĐ (e.g. 99000, 199000, 499000)
  DurationMonths: number; // Always 1 (monthly subscription)
  IsActive: boolean;
}

// Current Membership Response (GET /api/Memberships/current)
// Backend cũng trả về PascalCase!
export interface CurrentMembershipDto {
  MembershipPlanId: string;
  PlanName: string;
  MonthlyEventLimit: number;
  StartDate: string; // ISO DateTime
  EndDate: string; // ISO DateTime
  RemainingEventQuota: number | null;
  IsActive: boolean;
}

// Enroll Membership Request (POST /api/Memberships)
export interface EnrollMembershipRequest {
  planId: string; // camelCase for request body
}

// Enroll Membership Response (POST /api/Memberships)
export interface EnrollMembershipResponse {
  success: boolean;
  membershipId: string;
  planName: string;
  startDate: string;
  endDate: string;
  amountPaid: number;
  message: string;
}

// Cancel Membership Response (POST /api/Memberships/cancel)
export interface CancelMembershipResponse {
  success: boolean;
  message: string;
  endDate: string;
}

// Membership Tree types based on API response
export interface RoomInfo {
  roomId: string;
  roomName: string;
}

export interface ClubInfo {
  clubId: string;
  clubName: string;
  rooms: RoomInfo[];
}

export interface MembershipTreeResponse {
  clubs: ClubInfo[];
  overview: {
    clubCount: number;
    roomCount: number;
  };
}

// Frontend types for sidebar
export interface SidebarClub {
  id: string;
  name: string;
  roomsCount: number;
  avatar?: string;
  color?: string;
}

export interface SidebarRoom {
  id: string;
  name: string;
  clubId: string;
  avatar?: string;
  color?: string;
}
