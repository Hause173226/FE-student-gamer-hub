import axiosInstance from './axiosInstance';
import { MembershipTreeResponse, SidebarClub } from '../types/membership';
import { API_CONFIG } from '../config/apiConfig';

export class MembershipService {
  // Get membership tree (clubs and rooms that user is member of)
  static async getMembershipTree(): Promise<SidebarClub[]> {
    try {
      console.log('🔄 Fetching membership tree...');
      const response = await axiosInstance.get<MembershipTreeResponse>(API_CONFIG.ENDPOINTS.MEMBERSHIPS.TREE);
      console.log('✅ Membership tree fetched:', response.data);
      
      // Transform backend data to frontend format
      return response.data.Clubs.map((club, index) => this.transformClub(club, index));
    } catch (error) {
      console.error('❌ Error fetching membership tree:', error);
      throw new Error('Không thể tải danh sách clubs');
    }
  }

  // Transform backend ClubInfo to frontend SidebarClub
  private static transformClub(club: any, index: number): SidebarClub {
    return {
      id: club.ClubId,
      name: club.ClubName,
      roomsCount: club.Rooms?.length || 0,
      // Add frontend-specific properties
      avatar: this.getClubAvatar(club.ClubName),
      color: this.getClubColor(index),
    };
  }

  // Get club avatar based on name
  private static getClubAvatar(name: string): string {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('casual') || nameLower.includes('thường')) return '🎮';
    if (nameLower.includes('competitive') || nameLower.includes('thi đấu')) return '🏆';
    if (nameLower.includes('beginner') || nameLower.includes('mới')) return '🌱';
    if (nameLower.includes('pro') || nameLower.includes('chuyên')) return '⭐';
    if (nameLower.includes('fun') || nameLower.includes('vui')) return '😄';
    if (nameLower.includes('study') || nameLower.includes('học')) return '📚';
    if (nameLower.includes('tournament') || nameLower.includes('giải')) return '🏅';
    if (nameLower.includes('voice') || nameLower.includes('voice-chat')) return '🎤';
    return '🎮'; // Default
  }

  // Get club color based on index
  private static getClubColor(index: number): string {
    const colors = [
      'from-blue-500 to-cyan-600',
      'from-green-500 to-emerald-600',
      'from-purple-500 to-pink-600',
      'from-orange-500 to-red-600',
      'from-indigo-500 to-purple-600',
      'from-yellow-500 to-orange-600',
      'from-cyan-500 to-blue-600',
      'from-pink-500 to-rose-600',
    ];
    return colors[index % colors.length];
  }
}

export default MembershipService;
