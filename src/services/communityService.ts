import axiosInstance, { authAxiosInstance } from './axiosInstance';
import { CommunityDTO, Community } from '../types/community';
import { API_CONFIG } from '../config/apiConfig';

export class CommunityService {
  // Get all communities with search and pagination
  static async getAllCommunities(options?: {
    query?: string;
    offset?: number;
    limit?: number;
    orderBy?: 'trending' | 'newest';
  }): Promise<Community[]> {
    try {
      console.log('🔄 Fetching all communities...', options);
      
      const params = new URLSearchParams();
      if (options?.query) params.append('query', options.query);
      if (options?.offset) params.append('offset', options.offset.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.orderBy) params.append('orderBy', options.orderBy);
      
      const url = params.toString() ? `${API_CONFIG.ENDPOINTS.COMMUNITIES.BASE}?${params}` : API_CONFIG.ENDPOINTS.COMMUNITIES.BASE;
      const response = await axiosInstance.get<{
        Items: CommunityDTO[];
        NextCursor: string | null;
        PrevCursor: string | null;
        Size: number;
        Sort: string;
        Desc: boolean;
      }>(url);
      
      console.log('✅ Communities fetched:', response.data);
      
      // Transform backend data to frontend format
      return response.data.Items.map(community => this.transformCommunity(community));
    } catch (error) {
      console.error('❌ Error fetching communities:', error);
      throw new Error('Không thể tải danh sách cộng đồng');
    }
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

  // Join community
  static async joinCommunity(communityId: string): Promise<Community> {
    try {
      console.log(`🔄 Joining community ${communityId}...`);
      const response = await authAxiosInstance.post<CommunityDTO>(API_CONFIG.ENDPOINTS.COMMUNITIES.JOIN(communityId));
      console.log('✅ Joined community:', response.data);
      
      return this.transformCommunity(response.data);
    } catch (error) {
      console.error(`❌ Error joining community ${communityId}:`, error);
      throw new Error('Không thể tham gia cộng đồng');
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
      createdAt: new Date().toISOString().split('T')[0], // Default to today
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
