import axiosInstance from './axiosInstance';
import { ClubDTO, Club, ClubMemberDTO, JoinClubDTO } from '../types/club';

const API_BASE_URL = '/api/clubs';

export class ClubService {
  // Get clubs by community ID
  static async getClubsByCommunityId(communityId: number): Promise<Club[]> {
    try {
      console.log(`🔄 Fetching clubs for community ${communityId}...`);
      const response = await axiosInstance.get<ClubDTO[]>(`${API_BASE_URL}/community/${communityId}`);
      console.log('✅ Clubs fetched:', response.data);
      
      return response.data.map((club, index) => this.transformClub(club, index));
    } catch (error) {
      console.error('❌ Error fetching clubs by community:', error);
      throw new Error('Không thể tải danh sách clubs của cộng đồng');
    }
  }

  // Get all public clubs
  static async getAllPublicClubs(): Promise<Club[]> {
    try {
      console.log('🔄 Fetching all public clubs...');
      const response = await axiosInstance.get<ClubDTO[]>(`${API_BASE_URL}/public`);
      console.log('✅ Public clubs fetched:', response.data);
      
      return response.data.map((club, index) => this.transformClub(club, index));
    } catch (error) {
      console.error('❌ Error fetching public clubs:', error);
      throw new Error('Không thể tải danh sách clubs công khai');
    }
  }

  // Get all private clubs
  static async getAllPrivateClubs(): Promise<Club[]> {
    try {
      console.log('🔄 Fetching all private clubs...');
      const response = await axiosInstance.get<ClubDTO[]>(`${API_BASE_URL}/private`);
      console.log('✅ Private clubs fetched:', response.data);
      
      return response.data.map((club, index) => this.transformClub(club, index));
    } catch (error) {
      console.error('❌ Error fetching private clubs:', error);
      throw new Error('Không thể tải danh sách clubs riêng tư');
    }
  }

  // Get club by ID
  static async getClubById(id: number): Promise<Club> {
    try {
      console.log(`🔄 Fetching club ${id}...`);
      const response = await axiosInstance.get<ClubDTO>(`${API_BASE_URL}/${id}`);
      console.log('✅ Club fetched:', response.data);
      
      return this.transformClub(response.data, id);
    } catch (error) {
      console.error(`❌ Error fetching club ${id}:`, error);
      throw new Error('Không thể tải thông tin club');
    }
  }

  // Create new club in community
  static async createClub(communityId: number, creatorId: number, clubData: Partial<ClubDTO>): Promise<Club> {
    try {
      console.log(`🔄 Creating club in community ${communityId}...`, clubData);
      const response = await axiosInstance.post<ClubDTO>(`${API_BASE_URL}/community/${communityId}/user/${creatorId}`, clubData);
      console.log('✅ Club created:', response.data);
      
      return this.transformClub(response.data, 0);
    } catch (error) {
      console.error('❌ Error creating club:', error);
      throw new Error('Không thể tạo club mới');
    }
  }

  // Update club
  static async updateClub(id: number, clubData: Partial<ClubDTO>): Promise<Club> {
    try {
      console.log(`🔄 Updating club ${id}...`, clubData);
      const response = await axiosInstance.patch<ClubDTO>(`${API_BASE_URL}/${id}`, clubData);
      console.log('✅ Club updated:', response.data);
      
      return this.transformClub(response.data, id);
    } catch (error) {
      console.error(`❌ Error updating club ${id}:`, error);
      throw new Error('Không thể cập nhật club');
    }
  }

  // Delete club
  static async deleteClub(id: number): Promise<void> {
    try {
      console.log(`🔄 Deleting club ${id}...`);
      await axiosInstance.delete(`${API_BASE_URL}/${id}`);
      console.log('✅ Club deleted');
    } catch (error) {
      console.error(`❌ Error deleting club ${id}:`, error);
      throw new Error('Không thể xóa club');
    }
  }

  // Join club
  static async joinClub(clubId: number, userId: number): Promise<ClubMemberDTO> {
    try {
      console.log(`🔄 Joining club ${clubId}...`);
      const response = await axiosInstance.post<ClubMemberDTO>(`/api/club-members/${clubId}/join`, { userId });
      console.log('✅ Joined club:', response.data);
      
      return response.data;
    } catch (error) {
      console.error(`❌ Error joining club ${clubId}:`, error);
      throw new Error('Không thể tham gia club');
    }
  }

  // Kick club member
  static async kickClubMember(clubId: number, targetUserId: number, adminId: number): Promise<void> {
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
      id: id,
      name: club.name,
      description: club.description,
      isPublic: club.isPublic,
      membersCount: club.membersCount,
      // Add frontend-specific properties
      avatar: this.getClubAvatar(club.name),
      color: this.getClubColor(id),
      verified: club.membersCount > 50, // Auto-verify clubs with 50+ members
      trending: club.membersCount > 100, // Trending if 100+ members
      category: this.getClubCategory(club.name, club.description),
      createdAt: new Date().toISOString().split('T')[0], // Default to today
      isJoined: false, // Default to not joined
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
