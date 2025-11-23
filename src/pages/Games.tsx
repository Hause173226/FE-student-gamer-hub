import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Star, Clock, Trophy, Users, Gamepad2, ChevronRight, Loader2 } from 'lucide-react';
import GameService, { Game, GameSearchParams } from '../services/gameService';
import { useAuth } from '../contexts/AuthContext';

const Games: React.FC = () => {
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<GameSearchParams>({
    query: '',
    genre: '',
    platform: '',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 12
  });
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [addGameForm, setAddGameForm] = useState({
    inGameName: '',
    skillLevel: 1
  });
  const [addingGame, setAddingGame] = useState(false);

  // Load games on component mount and when search params change
  useEffect(() => {
    loadGames();
  }, [searchParams]);

  const loadGames = async () => {
    try {
      setLoading(true);
      const response = await GameService.getAllGames(searchParams);
      setGames(response.items);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchParams(prev => ({ ...prev, query, page: 1 }));
  };

  const handleFilterChange = (key: keyof GameSearchParams, value: any) => {
    setSearchParams(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleAddGame = (game: Game) => {
    setSelectedGame(game);
    setAddGameForm({
      inGameName: '',
      skillLevel: 1
    });
    setShowAddModal(true);
  };

  const handleSubmitAddGame = async () => {
    if (!selectedGame || !addGameForm.inGameName.trim()) return;

    try {
      setAddingGame(true);
      await GameService.addGameToLibrary(selectedGame.id, {
        inGameName: addGameForm.inGameName.trim(),
        skillLevel: addGameForm.skillLevel
      });
      
      // Refresh games to update isInLibrary status
      await loadGames();
      setShowAddModal(false);
      setSelectedGame(null);
      toast.success('Game đã được thêm vào thư viện!');
    } catch (error: any) {
      console.error('Error adding game:', error);
      toast.error(error.message || 'Không thể thêm game vào thư viện');
    } finally {
      setAddingGame(false);
    }
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  const genres = ['Action', 'RPG', 'Strategy', 'FPS', 'MOBA', 'Battle Royale', 'Sports', 'Racing'];
  const platforms = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Gamepad2 className="w-8 h-8" />
                Games Library
              </h1>
              <p className="text-gray-300 mt-2">Khám phá và quản lý thư viện games của bạn</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-300">
                {games.filter(g => g.isInLibrary).length}
              </div>
              <div className="text-sm text-gray-300">Games trong thư viện</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm games..."
                value={searchParams.query || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={searchParams.genre || ''}
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Tất cả thể loại</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              <select
                value={searchParams.platform || ''}
                onChange={(e) => handleFilterChange('platform', e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Tất cả nền tảng</option>
                {platforms.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>

              <select
                value={`${searchParams.sortBy}-${searchParams.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  handleFilterChange('sortBy', sortBy);
                  handleFilterChange('sortOrder', sortOrder);
                }}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="name-asc">Tên A-Z</option>
                <option value="name-desc">Tên Z-A</option>
                <option value="releaseDate-desc">Mới nhất</option>
                <option value="releaseDate-asc">Cũ nhất</option>
                <option value="popularity-desc">Phổ biến nhất</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <span className="ml-2 text-gray-400">Đang tải games...</span>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12">
            <Gamepad2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">Không tìm thấy games</h3>
            <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onAddGame={handleAddGame}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                  >
                    Trước
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg ${
                        page === currentPage
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Game Modal */}
      {showAddModal && selectedGame && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Thêm {selectedGame.name} vào thư viện</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tên trong game *
                </label>
                <input
                  type="text"
                  value={addGameForm.inGameName}
                  onChange={(e) => setAddGameForm(prev => ({ ...prev, inGameName: e.target.value }))}
                  placeholder="Nhập tên nhân vật hoặc username"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Skill Level: {addGameForm.skillLevel}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={addGameForm.skillLevel}
                  onChange={(e) => setAddGameForm(prev => ({ ...prev, skillLevel: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Casual</span>
                  <span>{GameService.getSkillLevelText(addGameForm.skillLevel)}</span>
                  <span>Competitive</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitAddGame}
                disabled={!addGameForm.inGameName.trim() || addingGame}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {addingGame ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Đang thêm...
                  </>
                ) : (
                  'Thêm vào thư viện'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Game Card Component
interface GameCardProps {
  game: Game;
  onAddGame: (game: Game) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onAddGame }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
      {/* Game Image/Icon */}
      <div className={`h-32 bg-gradient-to-br ${game.color} flex items-center justify-center`}>
        <div className="text-6xl">{game.icon}</div>
      </div>

      {/* Game Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg truncate">{game.name}</h3>
          {game.isInLibrary && (
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
          )}
        </div>

        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{game.description}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="bg-gray-700 px-2 py-1 rounded">{game.genre}</span>
          <span className="bg-gray-700 px-2 py-1 rounded">{game.platform}</span>
        </div>

        {game.userGameInfo && (
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
          </div>
        )}

        <button
          onClick={() => onAddGame(game)}
          disabled={game.isInLibrary}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
            game.isInLibrary
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {game.isInLibrary ? (
            <>
              <Star className="w-4 h-4 mr-2 fill-current" />
              Đã có trong thư viện
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Thêm vào thư viện
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Games;
