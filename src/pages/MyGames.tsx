import React, { useState, useEffect } from 'react';
import { Star, Clock, Trophy, Users, Gamepad2, Edit3, Trash2, Loader2, Search, Filter } from 'lucide-react';
import GameService, { Game, UserGameInfo } from '../services/gameService';
import { useAuth } from '../contexts/AuthContext';

const MyGames: React.FC = () => {
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserGame, setSelectedUserGame] = useState<UserGameInfo | null>(null);
  const [editForm, setEditForm] = useState({
    inGameName: '',
    skillLevel: 1,
    isFavorite: false
  });
  const [updating, setUpdating] = useState(false);

  // Load my games on component mount
  useEffect(() => {
    loadMyGames();
  }, []);

  const loadMyGames = async () => {
    try {
      setLoading(true);
      const myGames = await GameService.getMyGames();
      setGames(myGames);
    } catch (error) {
      console.error('Error loading my games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditGame = (userGameInfo: UserGameInfo) => {
    setSelectedUserGame(userGameInfo);
    setEditForm({
      inGameName: userGameInfo.inGameName,
      skillLevel: userGameInfo.skillLevel,
      isFavorite: userGameInfo.isFavorite
    });
    setShowEditModal(true);
  };

  const handleUpdateGame = async () => {
    if (!selectedUserGame) return;

    try {
      setUpdating(true);
      await GameService.updateUserGameInfo(selectedUserGame.id, {
        inGameName: editForm.inGameName.trim(),
        skillLevel: editForm.skillLevel,
        isFavorite: editForm.isFavorite
      });
      
      // Refresh games
      await loadMyGames();
      setShowEditModal(false);
      setSelectedUserGame(null);
    } catch (error) {
      console.error('Error updating game:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveGame = async (userGameId: string) => {
    if (!confirm('Bạn có chắc muốn xóa game này khỏi thư viện?')) return;

    try {
      await GameService.removeGameFromLibrary(userGameId);
      await loadMyGames();
    } catch (error) {
      console.error('Error removing game:', error);
    }
  };

  // Filter games based on search and genre
  const filteredGames = games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.userGameInfo?.inGameName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = !filterGenre || game.genre === filterGenre;
    return matchesSearch && matchesGenre;
  });

  const genres = [...new Set(games.map(g => g.genre))];

  // Calculate stats
  const totalGames = games.length;
  const favoriteGames = games.filter(g => g.userGameInfo?.isFavorite).length;
  const totalPlayTime = games.reduce((sum, g) => sum + (g.userGameInfo?.playTime || 0), 0);
  const avgSkillLevel = games.length > 0 
    ? games.reduce((sum, g) => sum + (g.userGameInfo?.skillLevel || 0), 0) / games.length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900 to-blue-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Gamepad2 className="w-8 h-8" />
                My Games
              </h1>
              <p className="text-gray-300 mt-2">Quản lý thư viện games cá nhân</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-300">
                {totalGames}
              </div>
              <div className="text-sm text-gray-300">Games trong thư viện</div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalGames}</div>
                  <div className="text-sm text-gray-300">Total Games</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-600 rounded-lg">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{favoriteGames}</div>
                  <div className="text-sm text-gray-300">Favorites</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{Math.round(totalPlayTime / 60)}h</div>
                  <div className="text-sm text-gray-300">Play Time</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-lg">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{avgSkillLevel.toFixed(1)}</div>
                  <div className="text-sm text-gray-300">Avg Skill</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm games hoặc in-game name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-3 focus:ring-2 focus:ring-green-500"
              >
                <option value="">Tất cả thể loại</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            <span className="ml-2 text-gray-400">Đang tải thư viện games...</span>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-12">
            <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {searchQuery || filterGenre ? 'Không tìm thấy games' : 'Thư viện trống'}
            </h3>
            <p className="text-gray-500">
              {searchQuery || filterGenre 
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Hãy thêm games vào thư viện để bắt đầu'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game, index) => (
              <MyGameCard
                key={game.id || `game-${index}`}
                game={game}
                onEdit={handleEditGame}
                onRemove={handleRemoveGame}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Game Modal */}
      {showEditModal && selectedUserGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Chỉnh sửa thông tin game</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tên trong game *
                </label>
                <input
                  type="text"
                  value={editForm.inGameName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, inGameName: e.target.value }))}
                  placeholder="Nhập tên nhân vật hoặc username"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Skill Level: {editForm.skillLevel}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={editForm.skillLevel}
                  onChange={(e) => setEditForm(prev => ({ ...prev, skillLevel: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Casual</span>
                  <span>{GameService.getSkillLevelText(editForm.skillLevel)}</span>
                  <span>Competitive</span>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFavorite"
                  checked={editForm.isFavorite}
                  onChange={(e) => setEditForm(prev => ({ ...prev, isFavorite: e.target.checked }))}
                  className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                />
                <label htmlFor="isFavorite" className="ml-2 text-sm text-gray-300">
                  Yêu thích
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateGame}
                disabled={!editForm.inGameName.trim() || updating}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Đang cập nhật...
                  </>
                ) : (
                  'Cập nhật'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// My Game Card Component
interface MyGameCardProps {
  game: Game;
  onEdit: (userGameInfo: UserGameInfo) => void;
  onRemove: (userGameId: string) => void;
}

const MyGameCard: React.FC<MyGameCardProps> = ({ game, onEdit, onRemove }) => {
  if (!game.userGameInfo) return null;

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
      {/* Game Image/Icon */}
      <div className={`h-32 bg-gradient-to-br ${game.color} flex items-center justify-center relative`}>
        <div className="text-6xl">{game.icon}</div>
        {game.userGameInfo.isFavorite && (
          <div className="absolute top-2 right-2">
            <Star className="w-6 h-6 text-yellow-400 fill-current" />
          </div>
        )}
      </div>

      {/* Game Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg truncate">{game.name}</h3>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(game.userGameInfo!)}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onRemove(game.userGameInfo!.id)}
              className="p-1 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">In-game:</span>
            <span className="text-sm font-medium">{game.userGameInfo.inGameName}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Skill:</span>
            <span className={`text-sm font-medium ${GameService.getSkillLevelColor(game.userGameInfo.skillLevel)}`}>
              {GameService.getSkillLevelText(game.userGameInfo.skillLevel)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Play Time:</span>
            <span className="text-sm font-medium">{Math.round(game.userGameInfo.playTime / 60)}h</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Last Played:</span>
            <span className="text-sm font-medium">
              {new Date(game.userGameInfo.lastPlayed).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="bg-gray-700 px-2 py-1 rounded">{game.genre}</span>
          <span className="bg-gray-700 px-2 py-1 rounded">{game.platform}</span>
        </div>
      </div>
    </div>
  );
};

export default MyGames;
