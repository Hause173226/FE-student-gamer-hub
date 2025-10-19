import axiosInstance from './axiosInstance';
import { CommunityDTO, Community, CommunityListResponse, CommunityResponse } from '../types/community';

const API_BASE_URL = '/api/community';

export class CommunityService {
  // Get all communities
  static async getAllCommunities(): Promise<Community[]> {
    try {
      console.log('🔄 Fetching all communities...');
      const response = await axiosInstance.get<CommunityDTO[]>(API_BASE_URL);
      console.log('✅ Communities fetched:', response.data);
      
      // Transform backend data to frontend format
      return response.data.map(community => this.transformCommunity(community));
    } catch (error) {
      console.error('❌ Error fetching communities:', error);
      throw new Error('Không thể tải danh sách cộng đồng');
    }
  }

  // Get community by ID
  static async getCommunityById(id: number): Promise<Community> {
    try {
      console.log(`🔄 Fetching community ${id}...`);
      const response = await axiosInstance.get<CommunityDTO>(`${API_BASE_URL}/${id}`);
      console.log('✅ Community fetched:', response.data);
      
      return this.transformCommunity(response.data);
    } catch (error) {
      console.error(`❌ Error fetching community ${id}:`, error);
      throw new Error('Không thể tải thông tin cộng đồng');
    }
  }

  // Create new community
  static async createCommunity(communityData: Partial<CommunityDTO>): Promise<Community> {
    try {
      console.log('🔄 Creating community...', communityData);
      const response = await axiosInstance.post<CommunityDTO>(API_BASE_URL, communityData);
      console.log('✅ Community created:', response.data);
      
      return this.transformCommunity(response.data);
    } catch (error) {
      console.error('❌ Error creating community:', error);
      throw new Error('Không thể tạo cộng đồng mới');
    }
  }

  // Update community
  static async updateCommunity(id: number, communityData: Partial<CommunityDTO>): Promise<Community> {
    try {
      console.log(`🔄 Updating community ${id}...`, communityData);
      const response = await axiosInstance.patch<CommunityDTO>(`${API_BASE_URL}/${id}`, communityData);
      console.log('✅ Community updated:', response.data);
      
      return this.transformCommunity(response.data);
    } catch (error) {
      console.error(`❌ Error updating community ${id}:`, error);
      throw new Error('Không thể cập nhật cộng đồng');
    }
  }

  // Delete community
  static async deleteCommunity(id: number): Promise<void> {
    try {
      console.log(`🔄 Deleting community ${id}...`);
      await axiosInstance.delete(`${API_BASE_URL}/${id}`);
      console.log('✅ Community deleted');
    } catch (error) {
      console.error(`❌ Error deleting community ${id}:`, error);
      throw new Error('Không thể xóa cộng đồng');
    }
  }

  // Transform backend CommunityDTO to frontend Community
  private static transformCommunity(community: CommunityDTO): Community {
    return {
      id: community.id,
      name: community.name,
      description: community.description,
      school: community.school,
      isPublic: community.isPublic,
      membersCount: community.membersCount,
      clubCount: community.clubCount,
      eventCount: community.eventCount,
      games: community.gameDTO || [],
      // Add frontend-specific properties
      avatar: this.getCommunityAvatar(community.name),
      color: this.getCommunityColor(community.id),
      verified: community.membersCount > 100, // Auto-verify communities with 100+ members
      trending: community.membersCount > 500, // Trending if 500+ members
      category: this.getCommunityCategory(community.name, community.description),
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
  private static getCommunityColor(id: number): string {
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
    return colors[id % colors.length];
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
