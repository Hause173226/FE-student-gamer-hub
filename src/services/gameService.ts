import { authAxiosInstance } from './axiosInstance';
import { API_CONFIG } from '../config/apiConfig';

// ============================================
// GAME TYPES & INTERFACES
// ============================================

export interface Game {
  id: string;
  name: string;
  description: string;
  genre: string;
  platform: string;
  releaseDate: string;
  developer: string;
  publisher: string;
  imageUrl?: string;
  icon: string;
  color: string;
  isInLibrary: boolean;
  userGameInfo?: UserGameInfo;
}

export interface UserGameInfo {
  id: string;
  gameId: string;
  inGameName: string;
  skillLevel: number;
  playTime: number;
  lastPlayed: string;
  isFavorite: boolean;
  achievements: string[];
}

export interface GameSearchParams {
  query?: string;
  genre?: string;
  platform?: string;
  sortBy?: 'name' | 'releaseDate' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface GameResponse {
  items: Game[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ============================================
// GAME SERVICE
// ============================================

export class GameService {
  // Get all games with search and pagination
  static async getAllGames(params?: GameSearchParams): Promise<GameResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.query) searchParams.append('query', params.query);
      if (params?.genre) searchParams.append('genre', params.genre);
      if (params?.platform) searchParams.append('platform', params.platform);
      if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      
      const url = searchParams.toString() 
        ? `${API_CONFIG.ENDPOINTS.GAMES.BASE}?${searchParams}` 
        : API_CONFIG.ENDPOINTS.GAMES.BASE;
      
      const response = await authAxiosInstance.get<any>(url);
      
      // Handle the actual API response format
      const apiData = response.data;
      const items = apiData.Items || apiData.items || [];
      
      // Transform backend data to frontend format
      const transformedItems = items.map((game: any) => this.transformGame(game));
      
      return {
        items: transformedItems,
        totalCount: transformedItems.length,
        page: 1,
        pageSize: apiData.Size || 20,
        totalPages: 1,
        hasNext: !!apiData.NextCursor,
        hasPrevious: !!apiData.PrevCursor
      };
    } catch (error) {
      console.error('❌ Error fetching games:', error);
      throw new Error('Không thể tải danh sách games');
    }
  }

  // Get user's games library
  static async getMyGames(): Promise<Game[]> {
    try {
      const response = await authAxiosInstance.get<any[]>(API_CONFIG.ENDPOINTS.GAMES.MY_GAMES);
      
      // API trả về format: [{ GameId, GameName, InGameName, Skill, AddedAt }]
      const apiGames = response.data || [];
      
      // Transform từng game từ API format sang Game format
      const transformedGames: Game[] = apiGames.map((apiGame: any) => {
        const gameId = apiGame.GameId || apiGame.gameId || apiGame.Id || apiGame.id;
        const gameName = apiGame.GameName || apiGame.gameName || apiGame.Name || apiGame.name || 'Unknown Game';
        
        // API có thể không trả về userGameInfo.id, dùng gameId làm id tạm thời
        // Hoặc có thể cần gọi API khác để lấy full info
        // Note: Có thể API trả về id ở field khác, cần check với backend
        const userGameId = apiGame.id || apiGame.Id || apiGame.UserGameId || apiGame.userGameId || gameId;
        
        // Tạo UserGameInfo từ API response
        const userGameInfo: UserGameInfo = {
          id: userGameId,
          gameId: gameId,
          inGameName: apiGame.InGameName || apiGame.inGameName || '',
          skillLevel: this.convertSkillLevelFromEnum(apiGame.Skill !== undefined ? apiGame.Skill : (apiGame.skillLevel || 1)),
          playTime: apiGame.PlayTime || apiGame.playTime || 0,
          lastPlayed: apiGame.AddedAt || apiGame.addedAt || apiGame.LastPlayed || apiGame.lastPlayed || new Date().toISOString(),
          isFavorite: apiGame.IsFavorite || apiGame.isFavorite || false,
          achievements: apiGame.Achievements || apiGame.achievements || []
        };
        
        // Tạo Game object với thông tin cơ bản
        const game: Game = {
          id: gameId,
          name: gameName,
          description: this.getGameDescription(gameName),
          genre: this.getGameGenre(gameName),
          platform: 'PC', // Default, có thể fetch từ API khác
          releaseDate: new Date().toISOString(), // Default
          developer: 'Unknown',
          publisher: 'Unknown',
          imageUrl: undefined,
          icon: this.getGameIcon(gameName),
          color: this.getGameColor(gameName),
          isInLibrary: true,
          userGameInfo: userGameInfo
        };
        
        return game;
      });
      
      return transformedGames;
    } catch (error) {
      console.error('❌ Error fetching my games:', error);
      throw new Error('Không thể tải thư viện games');
    }
  }
  
  // Convert skill level enum from backend to number (0=Casual, 1=Intermediate, 2=Competitive)
  private static convertSkillLevelFromEnum(enumValue: number): number {
    // Backend returns 0, 1, 2
    // Frontend expects 1-10 scale
    // Map: 0 -> 2, 1 -> 5, 2 -> 8
    if (enumValue === 0) return 2; // Casual
    if (enumValue === 1) return 5; // Intermediate
    if (enumValue === 2) return 8; // Competitive
    return enumValue; // If already in 1-10 scale, return as is
  }

  // Add game to library
  static async addGameToLibrary(gameId: string, userGameInfo: {
    inGameName: string;
    skillLevel: number;
  }): Promise<void> {
    try {
      // Convert skill level number to GameSkillLevel enum
      const skillLevel = this.convertSkillLevelToEnum(userGameInfo.skillLevel);
      
      // API endpoint: POST /api/me/games/{gameId}
      await authAxiosInstance.post(
        `${API_CONFIG.ENDPOINTS.GAMES.MY_GAMES}/${gameId}`,
        {
          InGameName: userGameInfo.inGameName,
          Skill: skillLevel
        }
      );
    } catch (error: any) {
      console.error(`❌ Error adding game ${gameId} to library:`, error);
      
      if (error.response?.status === 409) {
        throw new Error('Game này đã có trong thư viện của bạn');
      } else if (error.response?.status === 400) {
        throw new Error('Thông tin game không hợp lệ');
      } else if (error.response?.status === 401) {
        throw new Error('Bạn cần đăng nhập để thêm game');
      } else if (error.response?.status === 404) {
        throw new Error('Game không tồn tại');
      } else {
        throw new Error('Không thể thêm game vào thư viện');
      }
    }
  }

  // Update user game info
  static async updateUserGameInfo(userGameId: string, updates: {
    inGameName?: string;
    skillLevel?: number;
    isFavorite?: boolean;
  }): Promise<void> {
    try {
      // Convert skill level number to GameSkillLevel enum if provided
      const skillLevel = updates.skillLevel !== undefined 
        ? this.convertSkillLevelToEnum(updates.skillLevel) 
        : undefined;
      
      // API endpoint: PUT /api/me/games/{userGameId}
      await authAxiosInstance.put(
        `${API_CONFIG.ENDPOINTS.GAMES.MY_GAMES}/${userGameId}`,
        {
          InGameName: updates.inGameName,
          Skill: skillLevel
        }
      );
    } catch (error) {
      console.error(`❌ Error updating user game ${userGameId}:`, error);
      throw new Error('Không thể cập nhật thông tin game');
    }
  }

  // Remove game from library
  static async removeGameFromLibrary(userGameId: string): Promise<void> {
    try {
      // API endpoint: DELETE /api/me/games/{userGameId}
      await authAxiosInstance.delete(`${API_CONFIG.ENDPOINTS.GAMES.MY_GAMES}/${userGameId}`);
    } catch (error) {
      console.error(`❌ Error removing game ${userGameId}:`, error);
      throw new Error('Không thể xóa game khỏi thư viện');
    }
  }

  // Get game by ID
  static async getGameById(gameId: string): Promise<Game> {
    try {
      const response = await authAxiosInstance.get<Game>(`${API_CONFIG.ENDPOINTS.GAMES.BASE}/${gameId}`);
      return this.transformGame(response.data);
    } catch (error) {
      console.error(`❌ Error fetching game ${gameId}:`, error);
      throw new Error('Không thể tải thông tin game');
    }
  }

  // Transform backend Game to frontend Game
  private static transformGame(game: any): Game {
    // Handle both PascalCase and camelCase, and also GameName/GameId from UserGameDto
    const gameName = game?.Name || game?.name || game?.GameName || game?.gameName || 'Unknown Game';
    const gameId = game?.Id || game?.id || game?.GameId || game?.gameId || '';
    
    return {
      id: gameId,
      name: gameName,
      description: game?.Description || game?.description || this.getGameDescription(gameName),
      genre: game?.Genre || game?.genre || this.getGameGenre(gameName),
      platform: game?.Platform || game?.platform || 'PC',
      releaseDate: game?.ReleaseDate || game?.releaseDate || new Date().toISOString(),
      developer: game?.Developer || game?.developer || 'Unknown',
      publisher: game?.Publisher || game?.publisher || 'Unknown',
      imageUrl: game?.ImageUrl || game?.imageUrl,
      icon: this.getGameIcon(gameName),
      color: this.getGameColor(gameName),
      isInLibrary: game?.IsInLibrary || game?.isInLibrary || false,
      userGameInfo: game?.UserGameInfo || game?.userGameInfo ? this.transformUserGameInfo(game.UserGameInfo || game.userGameInfo) : undefined
    };
  }

  // Transform backend UserGameInfo to frontend UserGameInfo
  private static transformUserGameInfo(userGameInfo: any): UserGameInfo {
    return {
      id: userGameInfo?.id || userGameInfo?.Id || '',
      gameId: userGameInfo?.gameId || userGameInfo?.GameId || '',
      inGameName: userGameInfo?.inGameName || userGameInfo?.InGameName || '',
      skillLevel: userGameInfo?.skillLevel || userGameInfo?.SkillLevel || 1,
      playTime: userGameInfo?.playTime || userGameInfo?.PlayTime || 0,
      lastPlayed: userGameInfo?.lastPlayed || userGameInfo?.LastPlayed || new Date().toISOString(),
      isFavorite: userGameInfo?.isFavorite || userGameInfo?.IsFavorite || false,
      achievements: userGameInfo?.achievements || userGameInfo?.Achievements || []
    };
  }

  // Get game icon based on name
  private static getGameIcon(name: string): string {
    if (!name || typeof name !== 'string') return '🎮';
    const nameLower = name.toLowerCase().replace(/[^a-z0-9]/g, ''); // Remove special chars for matching
    const nameOriginal = name.toLowerCase();
    
    // Exact matches first
    if (nameOriginal.includes('valorant')) return '🎯';
    if (nameOriginal.includes('league of legends') || nameOriginal.includes('lol')) return '⚔️';
    if (nameOriginal.includes('dota 2') || nameOriginal.includes('dota2')) return '🗡️';
    if (nameOriginal.includes('counter-strike') || nameOriginal.includes('cs2') || nameOriginal.includes('cs 2')) return '🔫';
    if (nameOriginal.includes('overwatch 2') || nameOriginal.includes('overwatch2')) return '🛡️';
    if (nameOriginal.includes('apex legends') || nameOriginal.includes('apex')) return '🏹';
    if (nameOriginal.includes('fortnite')) return '🏗️';
    if (nameOriginal.includes('pubg') || nameOriginal.includes('battlegrounds')) return '🎯';
    if (nameOriginal.includes('rocket league')) return '🏎️';
    if (nameOriginal.includes('genshin impact') || nameOriginal.includes('genshin')) return '🌟';
    
    // Partial matches
    if (nameLower.includes('valorant')) return '🎯';
    if (nameLower.includes('league') || nameLower.includes('lol')) return '⚔️';
    if (nameLower.includes('dota')) return '🗡️';
    if (nameLower.includes('counter') || nameLower.includes('cs')) return '🔫';
    if (nameLower.includes('overwatch')) return '🛡️';
    if (nameLower.includes('apex')) return '🏹';
    if (nameLower.includes('fortnite')) return '🏗️';
    if (nameLower.includes('pubg')) return '🎯';
    if (nameLower.includes('rocket')) return '🏎️';
    if (nameLower.includes('genshin')) return '🌟';
    if (nameLower.includes('minecraft')) return '🧱';
    if (nameLower.includes('among')) return '👥';
    if (nameLower.includes('mobile') || nameLower.includes('mlbb')) return '📱';
    
    return '🎮'; // Default
  }

  // Get game color based on name
  private static getGameColor(name: string): string {
    if (!name || typeof name !== 'string') return 'from-gray-500 to-gray-600';
    const nameLower = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const nameOriginal = name.toLowerCase();
    
    // Exact matches first
    if (nameOriginal.includes('valorant')) return 'from-red-500 to-pink-600';
    if (nameOriginal.includes('league of legends') || nameOriginal.includes('lol')) return 'from-blue-500 to-cyan-600';
    if (nameOriginal.includes('dota 2') || nameOriginal.includes('dota2')) return 'from-purple-500 to-indigo-600';
    if (nameOriginal.includes('counter-strike') || nameOriginal.includes('cs2') || nameOriginal.includes('cs 2')) return 'from-orange-500 to-red-600';
    if (nameOriginal.includes('overwatch 2') || nameOriginal.includes('overwatch2')) return 'from-yellow-500 to-orange-600';
    if (nameOriginal.includes('apex legends') || nameOriginal.includes('apex')) return 'from-green-500 to-emerald-600';
    if (nameOriginal.includes('fortnite')) return 'from-pink-500 to-rose-600';
    if (nameOriginal.includes('pubg') || nameOriginal.includes('battlegrounds')) return 'from-indigo-500 to-purple-600';
    if (nameOriginal.includes('rocket league')) return 'from-orange-500 to-yellow-600';
    if (nameOriginal.includes('genshin impact') || nameOriginal.includes('genshin')) return 'from-cyan-500 to-blue-600';
    
    // Partial matches
    if (nameLower.includes('valorant')) return 'from-red-500 to-pink-600';
    if (nameLower.includes('league') || nameLower.includes('lol')) return 'from-blue-500 to-cyan-600';
    if (nameLower.includes('dota')) return 'from-purple-500 to-indigo-600';
    if (nameLower.includes('counter') || nameLower.includes('cs')) return 'from-orange-500 to-red-600';
    if (nameLower.includes('overwatch')) return 'from-yellow-500 to-orange-600';
    if (nameLower.includes('apex')) return 'from-green-500 to-emerald-600';
    if (nameLower.includes('fortnite')) return 'from-pink-500 to-rose-600';
    if (nameLower.includes('pubg')) return 'from-indigo-500 to-purple-600';
    if (nameLower.includes('rocket')) return 'from-orange-500 to-yellow-600';
    if (nameLower.includes('genshin')) return 'from-cyan-500 to-blue-600';
    if (nameLower.includes('minecraft')) return 'from-emerald-500 to-teal-600';
    if (nameLower.includes('among')) return 'from-cyan-500 to-blue-600';
    if (nameLower.includes('mobile') || nameLower.includes('mlbb')) return 'from-amber-500 to-yellow-600';
    
    return 'from-gray-500 to-gray-600'; // Default
  }

  // Convert skill level number to GameSkillLevel enum
  private static convertSkillLevelToEnum(level: number): number {
    if (level <= 3) return 0; // Casual
    if (level <= 7) return 1; // Intermediate
    return 2; // Competitive
  }

  // Get skill level text
  static getSkillLevelText(level: number): string {
    if (level <= 3) return 'Casual';
    if (level <= 7) return 'Intermediate';
    return 'Competitive';
  }

  // Get skill level color
  static getSkillLevelColor(level: number): string {
    if (level <= 3) return 'text-gray-400'; // Casual
    if (level <= 7) return 'text-blue-400'; // Intermediate
    return 'text-red-400'; // Competitive
  }

  // Get game description based on name
  private static getGameDescription(name: string): string {
    if (!name || typeof name !== 'string') return 'A popular gaming experience';
    const nameLower = name.toLowerCase();
    if (nameLower.includes('valorant')) return 'Tactical FPS game by Riot Games';
    if (nameLower.includes('league') || nameLower.includes('lol')) return 'MOBA game by Riot Games';
    if (nameLower.includes('dota')) return 'MOBA game by Valve';
    if (nameLower.includes('cs') || nameLower.includes('counter')) return 'Tactical FPS by Valve';
    if (nameLower.includes('overwatch')) return 'Hero shooter by Blizzard';
    if (nameLower.includes('apex')) return 'Battle royale by Respawn';
    if (nameLower.includes('fortnite')) return 'Battle royale by Epic Games';
    if (nameLower.includes('pubg')) return 'Battle royale by Krafton';
    if (nameLower.includes('rocket')) return 'Soccer with cars by Psyonix';
    if (nameLower.includes('genshin')) return 'Open-world RPG by miHoYo';
    return 'An exciting gaming experience';
  }

  // Get game genre based on name
  private static getGameGenre(name: string): string {
    if (!name || typeof name !== 'string') return 'Action';
    const nameLower = name.toLowerCase();
    if (nameLower.includes('valorant') || nameLower.includes('cs') || nameLower.includes('counter')) return 'FPS';
    if (nameLower.includes('league') || nameLower.includes('lol') || nameLower.includes('dota')) return 'MOBA';
    if (nameLower.includes('overwatch')) return 'Hero Shooter';
    if (nameLower.includes('apex') || nameLower.includes('fortnite') || nameLower.includes('pubg')) return 'Battle Royale';
    if (nameLower.includes('rocket')) return 'Sports';
    if (nameLower.includes('genshin')) return 'RPG';
    return 'Action';
  }
}

export default GameService;
