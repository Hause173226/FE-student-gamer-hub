import axiosInstance, { authAxiosInstance } from './axiosInstance';
import { 
  CommunityDTO, 
  Community, 
  CommunitySearchFilters, 
  CommunityDiscoverFilters,
  CursorPageResult,
  PagedResult,
  CommunityMemberDto,
  OffsetPage
} from '../types/community';
import { API_CONFIG } from '../config/apiConfig';

export class CommunityService {
  // Discover communities (PUBLIC endpoint - no auth required)
  // Uses offset pagination, supports trending/newest ordering
  static async discoverCommunities(filters?: CommunityDiscoverFilters): Promise<{
    communities: Community[];
    pagination: {
      page: number;
      size: number;
      totalCount: number;
      totalPages: number;
      hasPrevious: boolean;
      hasNext: boolean;
    };
  }> {
    try {
      console.log('🔄 Discovering communities...', filters);
      
      const params = new URLSearchParams();
      if (filters?.query) params.append('query', filters.query);
      if (filters?.offset !== undefined) params.append('offset', filters.offset.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.orderBy) params.append('orderBy', filters.orderBy);
      
      // Use public discover endpoint (no auth required)
      const url = params.toString() 
        ? `${API_CONFIG.ENDPOINTS.COMMUNITIES.DISCOVER}?${params}` 
        : API_CONFIG.ENDPOINTS.COMMUNITIES.DISCOVER;
      
      const response = await axiosInstance.get<PagedResult<CommunityDTO>>(url);
      
      console.log('✅ Communities discovered:', response.data);
      
      return {
        communities: response.data.Items.map(community => this.transformCommunity(community)),
        pagination: {
          page: response.data.Page,
          size: response.data.Size,
          totalCount: response.data.TotalCount,
          totalPages: response.data.TotalPages,
          hasPrevious: response.data.HasPrevious,
          hasNext: response.data.HasNext,
        }
      };
    } catch (error) {
      console.error('❌ Error discovering communities:', error);
      throw new Error('Không thể tải danh sách cộng đồng');
    }
  }

  // Search communities with filters (AUTH required)
  // Uses cursor-based pagination
  static async searchCommunities(filters?: CommunitySearchFilters): Promise<{
    communities: Community[];
    pagination: {
      nextCursor: string | null;
      prevCursor: string | null;
      size: number;
    };
  }> {
    try {
      console.log('🔄 Searching communities...', filters);
      
      const params = new URLSearchParams();
      if (filters?.school) params.append('school', filters.school);
      if (filters?.gameId) params.append('gameId', filters.gameId);
      if (filters?.isPublic !== undefined) params.append('isPublic', filters.isPublic.toString());
      if (filters?.membersFrom !== undefined) params.append('membersFrom', filters.membersFrom.toString());
      if (filters?.membersTo !== undefined) params.append('membersTo', filters.membersTo.toString());
      if (filters?.cursor) params.append('cursor', filters.cursor);
      if (filters?.size) params.append('size', filters.size.toString());
      
      const url = params.toString() 
        ? `${API_CONFIG.ENDPOINTS.COMMUNITIES.BASE}?${params}` 
        : API_CONFIG.ENDPOINTS.COMMUNITIES.BASE;
      
      const response = await axiosInstance.get<CursorPageResult<CommunityDTO>>(url);
      
      console.log('✅ Communities searched:', response.data);
      
      return {
        communities: response.data.Items.map(community => this.transformCommunity(community)),
        pagination: {
          nextCursor: response.data.NextCursor,
          prevCursor: response.data.PrevCursor,
          size: response.data.Size,
        }
      };
    } catch (error) {
      console.error('❌ Error searching communities:', error);
      throw new Error('Không thể tìm kiếm cộng đồng');
    }
  }

  // Get all communities (backward compatibility - uses discover)
  static async getAllCommunities(options?: {
    query?: string;
    offset?: number;
    limit?: number;
    orderBy?: 'trending' | 'newest';
  }): Promise<Community[]> {
    const result = await this.discoverCommunities({
      query: options?.query,
      offset: options?.offset,
      limit: options?.limit || 20,
      orderBy: options?.orderBy || 'trending',
    });
    return result.communities;
  }

  // Get community by ID
  static async getCommunityById(id: string): Promise<Community> {
    try {
      console.log(`🔄 Fetching community ${id}...`);
      const response = await axiosInstance.get<CommunityDTO>(API_CONFIG.ENDPOINTS.COMMUNITIES.BY_ID(id));
      console.log('✅ Community fetched:', response.data);
      
      return this.transformCommunity(response.data);
    } catch (error) {
      console.error(`❌ Error fetching community ${id}:`, error);
      throw new Error('Không thể tải thông tin cộng đồng');
    }
  }

  // Create new community
  static async createCommunity(communityData: {
    name: string;
    description?: string;
    school?: string;
    isPublic?: boolean;
  }): Promise<Community> {
    try {
      console.log('🔄 Creating community...', communityData);
      const response = await axiosInstance.post<CommunityDTO>(API_CONFIG.ENDPOINTS.COMMUNITIES.BASE, communityData);
      console.log('✅ Community created:', response.data);
      
      return this.transformCommunity(response.data);
    } catch (error) {
      console.error('❌ Error creating community:', error);
      throw new Error('Không thể tạo cộng đồng mới');
    }
  }

  // Join community (idempotent - safe to call multiple times)
  static async joinCommunity(communityId: string): Promise<Community> {
    try {
      console.log(`🔄 Joining community ${communityId}...`);
      const response = await authAxiosInstance.post<CommunityDTO>(API_CONFIG.ENDPOINTS.COMMUNITIES.JOIN(communityId));
      console.log('✅ Joined community:', response.data);
      
      return this.transformCommunity(response.data);
    } catch (error: any) {
      console.error(`❌ Error joining community ${communityId}:`, error);
      
      // Handle specific error cases
      if (error.response?.status === 409) {
        throw new Error('Bạn đã là thành viên của cộng đồng này');
      }
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy cộng đồng');
      }
      if (error.response?.status === 401) {
        throw new Error('Vui lòng đăng nhập để tham gia cộng đồng');
      }
      
      throw new Error('Không thể tham gia cộng đồng');
    }
  }

  // Get community members with filters
  static async getCommunityMembers(
    communityId: string,
    options?: {
      role?: 'Owner' | 'Moderator' | 'Member';
      query?: string;
      sort?: string;
      offset?: number;
      limit?: number;
    }
  ): Promise<{
    members: CommunityMemberDto[];
    pagination: {
      page: number;
      size: number;
      totalCount: number;
      totalPages: number;
      hasPrevious: boolean;
      hasNext: boolean;
    };
  }> {
    try {
      console.log(`🔄 Fetching members for community ${communityId}...`, options);
      
      const params = new URLSearchParams();
      if (options?.role) params.append('role', options.role);
      if (options?.query) params.append('q', options.query);
      if (options?.sort) params.append('sort', options.sort);
      if (options?.offset !== undefined) params.append('offset', options.offset.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      
      const url = params.toString()
        ? `${API_CONFIG.ENDPOINTS.COMMUNITIES.MEMBERS(communityId)}?${params}`
        : API_CONFIG.ENDPOINTS.COMMUNITIES.MEMBERS(communityId);
      
      const response = await axiosInstance.get<OffsetPage<CommunityMemberDto>>(url);
      
      console.log('✅ Community members fetched:', response.data);
      
      return {
        members: response.data.Items,
        pagination: {
          page: response.data.Page,
          size: response.data.Size,
          totalCount: response.data.TotalCount,
          totalPages: response.data.TotalPages,
          hasPrevious: response.data.HasPrevious,
          hasNext: response.data.HasNext,
        }
      };
    } catch (error) {
      console.error(`❌ Error fetching community members:`, error);
      throw new Error('Không thể tải danh sách thành viên');
    }
  }

  // Get recent members
  static async getRecentMembers(
    communityId: string,
    limit: number = 20
  ): Promise<CommunityMemberDto[]> {
    try {
      console.log(`🔄 Fetching recent members for community ${communityId}...`);
      
      const url = `${API_CONFIG.ENDPOINTS.COMMUNITIES.RECENT_MEMBERS(communityId)}?limit=${limit}`;
      const response = await axiosInstance.get<CommunityMemberDto[]>(url);
      
      console.log('✅ Recent members fetched:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching recent members:`, error);
      throw new Error('Không thể tải danh sách thành viên gần đây');
    }
  }

  // Remove member from community (Owner only)
  static async removeMember(communityId: string, userId: string): Promise<void> {
    try {
      console.log(`🔄 Removing member ${userId} from community ${communityId}...`);
      await authAxiosInstance.delete(API_CONFIG.ENDPOINTS.COMMUNITIES.REMOVE_MEMBER(communityId, userId));
      console.log('✅ Member removed');
    } catch (error: any) {
      console.error(`❌ Error removing member:`, error);
      
      if (error.response?.status === 403) {
        throw new Error('Chỉ chủ sở hữu mới có thể xóa thành viên');
      }
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy thành viên hoặc cộng đồng');
      }
      
      throw new Error('Không thể xóa thành viên');
    }
  }

  // Update community
  static async updateCommunity(id: string, communityData: {
    name: string;
    description?: string;
    school?: string;
    isPublic?: boolean;
  }): Promise<Community> {
    try {
      console.log(`🔄 Updating community ${id}...`, communityData);
      const response = await axiosInstance.put<CommunityDTO>(API_CONFIG.ENDPOINTS.COMMUNITIES.BY_ID(id), communityData);
      console.log('✅ Community updated:', response.data);
      
      return this.transformCommunity(response.data);
    } catch (error) {
      console.error(`❌ Error updating community ${id}:`, error);
      throw new Error('Không thể cập nhật cộng đồng');
    }
  }

  // Delete community
  static async deleteCommunity(id: string): Promise<void> {
    try {
      console.log(`🔄 Deleting community ${id}...`);
      await axiosInstance.delete(API_CONFIG.ENDPOINTS.COMMUNITIES.BY_ID(id));
      console.log('✅ Community deleted');
    } catch (error) {
      console.error(`❌ Error deleting community ${id}:`, error);
      throw new Error('Không thể xóa cộng đồng');
    }
  }

  // Transform backend CommunityDTO to frontend Community
  private static transformCommunity(community: CommunityDTO): Community {
    return {
      id: community.Id, // Keep as string GUID for frontend
      name: community.Name,
      description: community.Description || '',
      school: community.School || '',
      isPublic: community.IsPublic,
      membersCount: community.MembersCount,
      clubCount: community.ClubCount || 0,
      eventCount: community.EventCount || 0,
      games: community.GameDTO || [],
      // Add frontend-specific properties
      avatar: this.getCommunityAvatar(community.Name),
      color: this.getCommunityColor(community.Id),
      verified: community.MembersCount > 100, // Auto-verify communities with 100+ members
      trending: community.MembersCount > 500, // Trending if 500+ members
      category: this.getCommunityCategory(community.Name, community.Description || ''),
      createdAt: community.CreatedAtUtc 
        ? new Date(community.CreatedAtUtc).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      role: community.IsOwner ? 'Admin' : community.IsMember ? 'Member' : undefined,
    };
  }

  // Get community avatar based on name/description
  private static getCommunityAvatar(name: string): string {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('game') || nameLower.includes('gaming')) return '🎮';
    if (nameLower.includes('học') || nameLower.includes('education')) return '📚';
    if (nameLower.includes('thể thao') || nameLower.includes('sport')) return '⚽';
    if (nameLower.includes('âm nhạc') || nameLower.includes('music')) return '🎵';
    if (nameLower.includes('công nghệ') || nameLower.includes('tech')) return '💻';
    if (nameLower.includes('code') || nameLower.includes('programming')) return '💻';
    return '👥'; // Default
  }

  // Get community color based on ID
  private static getCommunityColor(id: string): string {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-cyan-500 to-blue-600',
      'from-yellow-500 to-orange-600',
      'from-green-500 to-emerald-600',
      'from-pink-500 to-rose-600',
    ];
    // Use hash of string ID to get consistent color
    const hash = id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }

  // Get community category based on name/description
  private static getCommunityCategory(name: string, description: string): string {
    const text = (name + ' ' + description).toLowerCase();
    if (text.includes('game') || text.includes('gaming')) return 'Gaming';
    if (text.includes('học') || text.includes('education') || text.includes('study')) return 'Education';
    if (text.includes('thể thao') || text.includes('sport')) return 'Sports';
    if (text.includes('âm nhạc') || text.includes('music')) return 'Music';
    if (text.includes('công nghệ') || text.includes('tech') || text.includes('code')) return 'Technology';
    return 'General';
  }
}

export default CommunityService;
