import axiosInstance from "./axiosInstance";
import {
  MembershipTreeResponse,
  SidebarClub,
  ClubInfo,
  CurrentMembershipDto,
  MembershipPlanDto,
  EnrollMembershipRequest,
  EnrollMembershipResponse,
} from "../types/membership";

export class MembershipService {
  // ==================== Membership Plans Endpoints ====================

  /**
   * GET /api/Memberships/public
   * Get all public membership plans (no auth required)
   */
  static async getPlans(): Promise<MembershipPlanDto[]> {
    try {
      const response = await axiosInstance.get<MembershipPlanDto[]>(
        "/api/Memberships/public"
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching membership plans:", error);
      throw error;
    }
  }

  // ==================== User Membership Endpoints ====================

  /**
   * GET /api/Memberships/current
   * Get current user's membership
   */
  static async getMyMembership(): Promise<CurrentMembershipDto | null> {
    try {
      const response = await axiosInstance.get<CurrentMembershipDto>(
        "/api/Memberships/current"
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No active membership
      }
      console.error("❌ Error fetching my membership:", error);
      throw error;
    }
  }

  /**
   * POST /api/Memberships
   * Enroll in a membership plan
   */
  static async enrollMembership(
    request: EnrollMembershipRequest
  ): Promise<EnrollMembershipResponse> {
    try {
      const response = await axiosInstance.post<EnrollMembershipResponse>(
        "/api/Memberships",
        request
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error enrolling membership:", error);
      // Handle specific error codes
      if (error.response?.status === 402) {
        throw new Error("Số dư ví không đủ. Vui lòng nạp thêm tiền.");
      }
      if (error.response?.status === 400) {
        throw new Error("Bạn đã có membership hoặc plan không hợp lệ.");
      }
      throw error;
    }
  }

  /**
   * PUT /api/Memberships/{planId}
   * Update/renew membership to a new plan
   */
  static async renewMembership(
    planId: string
  ): Promise<EnrollMembershipResponse> {
    try {
      const response = await axiosInstance.put<EnrollMembershipResponse>(
        `/api/Memberships/${planId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("❌ Error renewing membership:", error);
      if (error.response?.status === 402) {
        throw new Error("Số dư ví không đủ để gia hạn.");
      }
      throw error;
    }
  }

  // ==================== Membership Tree Endpoints ====================

  /**
   * GET /api/Memberships/tree
   * Get membership tree (clubs and rooms that current user is member of)
   */
  static async getMembershipTree(): Promise<SidebarClub[]> {
    try {
      const response = await axiosInstance.get<MembershipTreeResponse>(
        "/api/Memberships/tree"
      );

      console.log("📦 Membership tree response:", response.data);

      // Backend trả về PascalCase: Clubs, ClubId, ClubName, Rooms
      const clubs = response.data.Clubs || [];
      console.log(`✅ Found ${clubs.length} clubs in response`);

      // Transform backend data to frontend format
      return clubs.map((club: ClubInfo, index: number) =>
        this.transformClub(club, index)
      );
    } catch (error) {
      console.error("❌ Error fetching membership tree:", error);
      throw new Error("Không thể tải danh sách clubs");
    }
  }

  // ==================== Helper Methods ====================

  /**
   * Check if user has active membership
   */
  static async hasActiveMembership(): Promise<boolean> {
    try {
      const membership = await this.getMyMembership();
      return membership?.IsActive ?? false;
    } catch (error) {
      return false;
    }
  }

  // ==================== Transform Methods ====================

  /**
   * Transform backend ClubInfo to frontend SidebarClub
   * Backend trả về PascalCase: ClubId, ClubName, Rooms
   */
  private static transformClub(club: ClubInfo, index: number): SidebarClub {
    return {
      id: club.ClubId,
      name: club.ClubName,
      roomsCount: club.Rooms?.length || 0,
      avatar: this.getClubAvatar(club.ClubName),
      color: this.getClubColor(index),
    };
  }

  /**
   * Get club avatar based on name
   */
  private static getClubAvatar(name: string): string {
    const nameLower = name.toLowerCase();
    if (nameLower.includes("casual") || nameLower.includes("thường"))
      return "🎮";
    if (nameLower.includes("competitive") || nameLower.includes("thi đấu"))
      return "🏆";
    if (nameLower.includes("beginner") || nameLower.includes("mới"))
      return "🌱";
    if (nameLower.includes("pro") || nameLower.includes("chuyên")) return "⭐";
    if (nameLower.includes("fun") || nameLower.includes("vui")) return "😄";
    if (nameLower.includes("study") || nameLower.includes("học")) return "📚";
    if (nameLower.includes("tournament") || nameLower.includes("giải"))
      return "🏅";
    if (nameLower.includes("voice") || nameLower.includes("voice-chat"))
      return "🎤";
    return "🎮"; // Default
  }

  /**
   * Get club color based on index
   */
  private static getClubColor(index: number): string {
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

export default MembershipService;
