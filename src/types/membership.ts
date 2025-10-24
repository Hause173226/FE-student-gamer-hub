// Membership Tree types based on API response
export interface RoomInfo {
  RoomId: string;
  RoomName: string;
}

export interface ClubInfo {
  ClubId: string;
  ClubName: string;
  Rooms: RoomInfo[];
}

export interface MembershipTreeResponse {
  Clubs: ClubInfo[];
  Overview: {
    ClubCount: number;
    RoomCount: number;
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
