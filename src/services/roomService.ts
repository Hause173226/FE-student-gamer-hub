import { authAxiosInstance } from "./axiosInstance";
import {
  RoomDTO,
  Room,
  RoomMemberDTO,
  RoomJoinPolicy,
  RoomMemberStatus,
  RoomRole,
} from "../types/room";
import { API_CONFIG } from "../config/apiConfig";

export class RoomService {
  // Get rooms by club ID
  static async getRoomsByClubId(
    clubId: string,
    options?: {
      offset?: number;
      limit?: number;
    }
  ): Promise<Room[]> {
    try {
      console.log(`🔄 Fetching rooms for club ${clubId}...`);

      const params = new URLSearchParams();
      if (options?.offset) params.append("offset", options.offset.toString());
      if (options?.limit) params.append("limit", options.limit.toString());

      const url = params.toString()
        ? `${API_CONFIG.ENDPOINTS.ROOMS.BY_CLUB(clubId)}?${params}`
        : API_CONFIG.ENDPOINTS.ROOMS.BY_CLUB(clubId);

      const response = await authAxiosInstance.get<{
        Items: RoomDTO[];
        Page: number;
        Size: number;
        TotalCount: number;
        TotalPages: number;
        HasPrevious: boolean;
        HasNext: boolean;
        Sort: string;
        Desc: boolean;
      }>(url);
      console.log("✅ Rooms fetched:", response.data);

      return response.data.Items.map((room, index) =>
        this.transformRoom(room, index)
      );
    } catch (error) {
      console.error("❌ Error fetching rooms by club:", error);
      throw new Error("Không thể tải danh sách rooms của club");
    }
  }

  // Get room by ID
  static async getRoomById(roomId: string): Promise<Room> {
    try {
      console.log(`🔄 Fetching room ${roomId}...`);
      const response = await authAxiosInstance.get<RoomDTO>(
        API_CONFIG.ENDPOINTS.ROOMS.BY_ID(roomId)
      );
      console.log("✅ Room fetched:", response.data);

      return this.transformRoom(response.data, 0);
    } catch (error) {
      console.error(`❌ Error fetching room ${roomId}:`, error);
      throw new Error("Không thể tải thông tin room");
    }
  }

  // Create new room
  static async createRoom(roomData: {
    clubId: string;
    name: string;
    description?: string;
    joinPolicy: RoomJoinPolicy;
    capacity?: number;
    password?: string;
  }): Promise<Room> {
    try {
      console.log("🔄 Creating room...", roomData);

      const requestData = {
        clubId: roomData.clubId,
        name: roomData.name,
        description: roomData.description,
        joinPolicy: roomData.joinPolicy,
        capacity: roomData.capacity,
        password: roomData.password,
      };

      const response = await authAxiosInstance.post<RoomDTO>(
        API_CONFIG.ENDPOINTS.ROOMS.BASE,
        requestData
      );
      console.log("✅ Room created:", response.data);

      return this.transformRoom(response.data, 0);
    } catch (error) {
      console.error("❌ Error creating room:", error);
      throw new Error("Không thể tạo room mới");
    }
  }

  // Update room
  static async updateRoom(
    roomId: string,
    roomData: {
      name?: string;
      description?: string;
      joinPolicy?: RoomJoinPolicy;
      capacity?: number;
      password?: string;
    }
  ): Promise<Room> {
    try {
      console.log(`🔄 Updating room ${roomId}...`, roomData);

      const requestData = {
        name: roomData.name,
        description: roomData.description,
        joinPolicy: roomData.joinPolicy,
        capacity: roomData.capacity,
        password: roomData.password,
      };

      const response = await authAxiosInstance.put<RoomDTO>(
        API_CONFIG.ENDPOINTS.ROOMS.BY_ID(roomId),
        requestData
      );
      console.log("✅ Room updated:", response.data);

      return this.transformRoom(response.data, 0);
    } catch (error) {
      console.error(`❌ Error updating room ${roomId}:`, error);
      throw new Error("Không thể cập nhật room");
    }
  }

  // Delete room
  static async deleteRoom(roomId: string): Promise<void> {
    try {
      console.log(`🔄 Deleting room ${roomId}...`);
      await authAxiosInstance.delete(API_CONFIG.ENDPOINTS.ROOMS.BY_ID(roomId));
      console.log("✅ Room deleted");
    } catch (error) {
      console.error(`❌ Error deleting room ${roomId}:`, error);
      throw new Error("Không thể xóa room");
    }
  }

  // Join room
  static async joinRoom(
    roomId: string,
    request?: {
      password?: string;
      message?: string;
    }
  ): Promise<Room> {
    try {
      console.log(`🔄 Joining room ${roomId}...`);

      const requestData = {
        password: request?.password,
        message: request?.message,
      };

      const response = await authAxiosInstance.post<RoomDTO>(
        API_CONFIG.ENDPOINTS.ROOMS.JOIN(roomId),
        requestData
      );
      console.log("✅ Joined room:", response.data);

      return this.transformRoom(response.data, 0);
    } catch (error) {
      console.error(`❌ Error joining room ${roomId}:`, error);
      throw new Error("Không thể tham gia room");
    }
  }

  // Leave room
  static async leaveRoom(roomId: string): Promise<void> {
    try {
      console.log(`🔄 Leaving room ${roomId}...`);
      await authAxiosInstance.post(API_CONFIG.ENDPOINTS.ROOMS.LEAVE(roomId));
      console.log("✅ Left room");
    } catch (error) {
      console.error(`❌ Error leaving room ${roomId}:`, error);
      throw new Error("Không thể rời room");
    }
  }

  // Get room members
  static async getRoomMembers(
    roomId: string,
    options?: {
      role?: RoomRole;
      status?: RoomMemberStatus;
      query?: string;
      sort?: string;
      offset?: number;
      limit?: number;
    }
  ): Promise<any> {
    try {
      console.log(`🔄 Fetching members for room ${roomId}...`);

      const params = new URLSearchParams();
      if (options?.role !== undefined)
        params.append("role", options.role.toString());
      if (options?.status !== undefined)
        params.append("status", options.status.toString());
      if (options?.query) params.append("q", options.query);
      if (options?.sort) params.append("sort", options.sort);
      if (options?.offset) params.append("offset", options.offset.toString());
      if (options?.limit) params.append("limit", options.limit.toString());

      const url = params.toString()
        ? `${API_CONFIG.ENDPOINTS.ROOMS.MEMBERS(roomId)}?${params}`
        : API_CONFIG.ENDPOINTS.ROOMS.MEMBERS(roomId);

      const response = await authAxiosInstance.get(url);
      console.log("✅ Room members fetched:", response.data);

      // Return full response data (contains Items array)
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching room members:`, error);
      throw new Error("Không thể tải danh sách thành viên room");
    }
  }

  // Approve room member
  static async approveMember(roomId: string, userId: string): Promise<void> {
    try {
      console.log(`🔄 Approving member ${userId} for room ${roomId}...`);
      await authAxiosInstance.post(
        `${API_CONFIG.ENDPOINTS.ROOMS.MEMBERS(roomId)}/${userId}/approve`
      );
      console.log("✅ Member approved");
    } catch (error) {
      console.error(`❌ Error approving member:`, error);
      throw new Error("Không thể duyệt thành viên");
    }
  }

  // Reject room member
  static async rejectMember(roomId: string, userId: string): Promise<void> {
    try {
      console.log(`🔄 Rejecting member ${userId} for room ${roomId}...`);
      await authAxiosInstance.post(
        `${API_CONFIG.ENDPOINTS.ROOMS.MEMBERS(roomId)}/${userId}/reject`
      );
      console.log("✅ Member rejected");
    } catch (error) {
      console.error(`❌ Error rejecting member:`, error);
      throw new Error("Không thể từ chối thành viên");
    }
  }

  // Remove room member
  static async removeMember(roomId: string, userId: string): Promise<void> {
    try {
      console.log(`🔄 Removing member ${userId} from room ${roomId}...`);
      await authAxiosInstance.delete(
        `${API_CONFIG.ENDPOINTS.ROOMS.MEMBERS(roomId)}/${userId}`
      );
      console.log("✅ Member removed");
    } catch (error) {
      console.error(`❌ Error removing member:`, error);
      throw new Error("Không thể xóa thành viên");
    }
  }

  // Transform backend RoomDTO to frontend Room
  private static transformRoom(room: RoomDTO, index: number): Room {
    return {
      id: room.Id, // Keep as string GUID
      clubId: room.ClubId, // Keep as string GUID
      name: room.Name,
      description: room.Description || "",
      joinPolicy: room.JoinPolicy,
      capacity: room.Capacity,
      membersCount: room.MembersCount,
      // Add frontend-specific properties
      avatar: this.getRoomAvatar(room.Name),
      color: this.getRoomColor(index),
      isJoined: room.IsMember,
      isOwner: room.IsOwner,
      isMember: room.IsMember,
      membershipStatus: room.MembershipStatus,
      createdAt: room.CreatedAtUtc
        ? new Date(room.CreatedAtUtc).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    };
  }

  // Get room avatar based on name/description
  private static getRoomAvatar(name: string): string {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("general") || nameLower.includes("chung"))
      return "💬";
    if (nameLower.includes("voice") || nameLower.includes("voice-chat"))
      return "🎤";
    if (nameLower.includes("gaming") || nameLower.includes("game")) return "🎮";
    if (nameLower.includes("music") || nameLower.includes("nhạc")) return "🎵";
    if (nameLower.includes("study") || nameLower.includes("học")) return "📚";
    if (nameLower.includes("announcement") || nameLower.includes("thông báo"))
      return "📢";
    if (nameLower.includes("random") || nameLower.includes("ngẫu nhiên"))
      return "🎲";
    if (nameLower.includes("meme") || nameLower.includes("funny")) return "😂";
    return "💬"; // Default
  }

  // Get room color based on index
  private static getRoomColor(index: number): string {
    const colors = [
      "from-blue-500 to-cyan-600",
      "from-green-500 to-emerald-600",
      "from-purple-500 to-pink-600",
      "from-orange-500 to-red-600",
      "from-indigo-500 to-purple-600",
      "from-yellow-500 to-orange-600",
      "from-cyan-500 to-blue-600",
      "from-pink-500 to-rose-600",
    ];
    return colors[index % colors.length];
  }
}

export default RoomService;
