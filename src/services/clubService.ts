import axiosInstance from './axiosInstance';
import { ClubDTO, Club, ClubListResponse } from '../types/club';
import { API_CONFIG } from '../config/apiConfig';

export class ClubService {
  // Get clubs by community ID
  static async getClubsByCommunityId(communityId: string): Promise<Club[]> {
    try {
      console.log(`🔄 Fetching clubs for community ${communityId}...`);
      const response = await axiosInstance.get<ClubListResponse>(API_CONFIG.ENDPOINTS.CLUBS.BY_COMMUNITY(communityId));
      console.log('✅ Clubs fetched:', response.data);
      
      return response.data.Items.map((club, index) => this.transformClub(club, index));
    } catch (error) {
      console.error('❌ Error fetching clubs by community:', error);
      throw new Error('Không thể tải danh sách clubs của cộng đồng');
    }
  }

  // Get all public clubs
  static async getAllPublicClubs(): Promise<Club[]> {
    try {
      console.log('🔄 Fetching all public clubs...');
      const response = await axiosInstance.get<ClubListResponse>(API_CONFIG.ENDPOINTS.CLUBS.PUBLIC);
      console.log('✅ Public clubs fetched:', response.data);
      
      return response.data.Items.map((club, index) => this.transformClub(club, index));
    } catch (error) {
      console.error('❌ Error fetching public clubs:', error);
      throw new Error('Không thể tải danh sách clubs công khai');
    }
  }

  // Get all private clubs
  static async getAllPrivateClubs(): Promise<Club[]> {
    try {
      console.log('🔄 Fetching all private clubs...');
      const response = await axiosInstance.get<ClubListResponse>(API_CONFIG.ENDPOINTS.CLUBS.PRIVATE);
      console.log('✅ Private clubs fetched:', response.data);
      
      return response.data.Items.map((club, index) => this.transformClub(club, index));
    } catch (error) {
      console.error('❌ Error fetching private clubs:', error);
      throw new Error('Không thể tải danh sách clubs riêng tư');
    }
  }

  // Get club by ID
  static async getClubById(id: string): Promise<Club> {
    try {
      console.log(`🔄 Fetching club ${id}...`);
      const response = await axiosInstance.get<ClubDTO>(API_CONFIG.ENDPOINTS.CLUBS.BY_ID(id));
      console.log('✅ Club fetched:', response.data);
      
      return this.transformClub(response.data, parseInt(id));
    } catch (error) {
      console.error(`❌ Error fetching club ${id}:`, error);
      throw new Error('Không thể tải thông tin club');
    }
  }

  // Create new club in community
  static async createClub(communityId: string, clubData: {
    name: string;
    description?: string;
    isPublic?: boolean;
    membersCount?: number;
  }): Promise<Club> {
    try {
      console.log(`🔄 Creating club in community ${communityId}...`, clubData);
      const response = await axiosInstance.post<ClubDTO>(API_CONFIG.ENDPOINTS.CLUBS.BASE, {
        communityId: communityId,
        name: clubData.name,
        description: clubData.description,
        isPublic: clubData.isPublic ?? true
      });
      console.log('✅ Club created:', response.data);
      
      return this.transformClub(response.data, 0);
    } catch (error) {
      console.error('❌ Error creating club:', error);
      throw new Error('Không thể tạo club mới');
    }
  }

  // Update club
  static async updateClub(id: string, clubData: Partial<ClubDTO>): Promise<Club> {
    try {
      console.log(`🔄 Updating club ${id}...`, clubData);
      const response = await axiosInstance.patch<ClubDTO>(API_CONFIG.ENDPOINTS.CLUBS.BY_ID(id), clubData);
      console.log('✅ Club updated:', response.data);
      
      return this.transformClub(response.data, parseInt(id));
    } catch (error) {
      console.error(`❌ Error updating club ${id}:`, error);
      throw new Error('Không thể cập nhật club');
    }
  }

  // Delete club
  static async deleteClub(id: string): Promise<void> {
    try {
      console.log(`🔄 Deleting club ${id}...`);
      await axiosInstance.delete(API_CONFIG.ENDPOINTS.CLUBS.BY_ID(id));
      console.log('✅ Club deleted');
    } catch (error) {
      console.error(`❌ Error deleting club ${id}:`, error);
      throw new Error('Không thể xóa club');
    }
  }

  // Join club
  static async joinClub(clubId: string): Promise<void> {
    try {
      // Ensure clubId is a valid GUID string
      const validClubId = clubId.toString().trim();
      if (!validClubId) {
        throw new Error('Club ID không hợp lệ');
      }

      console.log(`🔄 Joining club...`);
      console.log(`📋 Club ID received: ${clubId}`);
      console.log(`📋 Club ID (validated): ${validClubId}`);
      
      // Use API_CONFIG endpoint - EXACTLY: /api/Clubs/{clubId}/join
      const endpoint = API_CONFIG.ENDPOINTS.CLUBS.JOIN(validClubId);
      console.log(`📡 API Endpoint: ${endpoint}`);
      console.log(`📡 Full URL: ${axiosInstance.defaults.baseURL}${endpoint}`);
      
      // POST request with empty body (backend doesn't require body)
      // Token will be automatically added by axiosInstance interceptor
      const response = await axiosInstance.post(endpoint, {});
      console.log('✅ Joined club successfully:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error(`❌ Error joining club ${clubId}:`, error);
      
      // Handle specific error cases
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        switch (status) {
          case 400:
            throw new Error(errorData?.message || 'Dữ liệu không hợp lệ. Vui lòng thử lại.');
          case 401:
            throw new Error('Vui lòng đăng nhập để tham gia club');
          case 403:
            throw new Error('Bạn không có quyền tham gia club này');
          case 404:
            throw new Error('Không tìm thấy club');
          case 409:
            throw new Error('Bạn đã là thành viên của club này');
          case 500:
            // Log detailed error for debugging
            const traceId = errorData?.traceId || errorData?.TraceId || 'N/A';
            const errorMessage = errorData?.message || errorData?.title || errorData?.detail || 'Lỗi server';
            
            console.error('Server error details:', {
              status: status,
              data: errorData,
              message: errorMessage,
              traceId: traceId,
              url: `/api/Clubs/${clubId}/join`
            });
            
            // Include traceId in error message for support
            throw new Error(`Lỗi server (TraceId: ${traceId}). Vui lòng thử lại sau hoặc liên hệ admin với TraceId này.`);
          default:
            throw new Error(errorData?.message || `Lỗi không xác định (${status}). Vui lòng thử lại.`);
        }
      }
      
      // Network error or other
      if (error.request) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet.');
      }
      
      throw new Error('Không thể tham gia club. Vui lòng thử lại.');
    }
  }

  // Get club members
  static async getClubMembers(clubId: string, options?: {
    offset?: number;
    limit?: number;
  }): Promise<{
    Items: any[]; // TODO: Define proper ClubMember type
    Page: number;
    Size: number;
    TotalCount: number;
    TotalPages: number;
    HasPrevious: boolean;
    HasNext: boolean;
    Sort: string;
    Desc: boolean;
  }> {
    try {
      console.log(`🔄 Fetching members for club ${clubId}...`);
      
      const params = new URLSearchParams();
      if (options?.offset) params.append('offset', options.offset.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      
      const url = params.toString() 
        ? `/api/Clubs/${clubId}/members?${params}` 
        : `/api/Clubs/${clubId}/members`;
      
      const response = await axiosInstance.get(url);
      console.log('✅ Club members fetched:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching club members:', error);
      throw new Error('Không thể tải danh sách thành viên club');
    }
  }

  // Kick club member
  static async kickClubMember(clubId: string, targetUserId: number, adminId: number): Promise<void> {
    try {
      console.log(`🔄 Kicking member ${targetUserId} from club ${clubId}...`);
      await axiosInstance.delete(`/api/club-members/${clubId}/members/${targetUserId}?adminId=${adminId}`);
      console.log('✅ Member kicked');
    } catch (error) {
      console.error(`❌ Error kicking member:`, error);
      throw new Error('Không thể kick thành viên');
    }
  }

  // Transform backend ClubDTO to frontend Club
  private static transformClub(club: ClubDTO, id: number): Club {
    return {
      id: club.Id, // Keep as string GUID for frontend
      name: club.Name,
      description: club.Description || '',
      isPublic: club.IsPublic,
      membersCount: club.MembersCount,
      // Add frontend-specific properties
      communityId: club.CommunityId, // Keep as string GUID
      avatar: this.getClubAvatar(club.Name),
      color: this.getClubColor(id),
      verified: club.MembersCount > 50, // Auto-verify clubs with 50+ members
      trending: club.MembersCount > 100, // Trending if 100+ members
      category: this.getClubCategory(club.Name, club.Description || ''),
      createdAt: new Date().toISOString().split('T')[0], // Default to today
      isJoined: club.IsMember || false,
      isOwner: club.IsOwner || false, // Add isOwner property
    };
  }

  // Get club avatar based on name/description
  private static getClubAvatar(name: string): string {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('valorant') || nameLower.includes('fps')) return '🔫';
    if (nameLower.includes('league') || nameLower.includes('lol')) return '⚔️';
    if (nameLower.includes('mobile') || nameLower.includes('mlbb')) return '📱';
    if (nameLower.includes('team') || nameLower.includes('squad')) return '👥';
    if (nameLower.includes('rank') || nameLower.includes('competitive')) return '🏆';
    if (nameLower.includes('casual') || nameLower.includes('fun')) return '🎮';
    return '🎯'; // Default
  }

  // Get club color based on ID
  private static getClubColor(id: number): string {
    const colors = [
      'from-red-500 to-pink-600',
      'from-blue-500 to-cyan-600',
      'from-yellow-500 to-orange-600',
      'from-green-500 to-emerald-600',
      'from-purple-500 to-pink-600',
      'from-indigo-500 to-purple-600',
      'from-cyan-500 to-blue-600',
      'from-orange-500 to-red-600',
    ];
    return colors[id % colors.length];
  }

  // Get club category based on name/description
  private static getClubCategory(name: string, description: string): string {
    const text = (name + ' ' + description).toLowerCase();
    if (text.includes('valorant') || text.includes('fps')) return 'FPS';
    if (text.includes('league') || text.includes('lol') || text.includes('moba')) return 'MOBA';
    if (text.includes('mobile') || text.includes('mlbb')) return 'Mobile';
    if (text.includes('rank') || text.includes('competitive')) return 'Competitive';
    if (text.includes('casual') || text.includes('fun')) return 'Casual';
    return 'Gaming';
  }
}

export default ClubService;
