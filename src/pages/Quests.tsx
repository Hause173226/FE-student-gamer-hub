import React, { useState, useEffect } from 'react';
import { Trophy, Star, Clock, CheckCircle, XCircle, Loader2, Zap, Users, Calendar, MessageSquare } from 'lucide-react';
import QuestService, { QuestItem, QuestTodayResponse } from '../services/questService';
import { useAuth } from '../contexts/AuthContext';

const Quests: React.FC = () => {
  const { user } = useAuth();
  const [questData, setQuestData] = useState<QuestTodayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingQuest, setCompletingQuest] = useState<string | null>(null);

  // Load quests on component mount
  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await QuestService.getTodayQuests();
      setQuestData(data);
    } catch (err) {
      console.error('Error loading quests:', err);
      setError('Không thể tải danh sách quests');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQuest = async (questCode: string) => {
    if (completingQuest) return;

    try {
      setCompletingQuest(questCode);
      
      let result;
      switch (questCode) {
        case 'CHECK_IN_DAILY':
          result = await QuestService.completeCheckIn();
          break;
        default:
          throw new Error('Quest không thể hoàn thành thủ công');
      }

      if (result.success) {
        // Refresh quest data to show updated status
        await loadQuests();
      } else {
        // Show message for idempotent case
        console.log(result.message);
      }
    } catch (err) {
      console.error('Error completing quest:', err);
    } finally {
      setCompletingQuest(null);
    }
  };

  const getQuestStats = () => {
    if (!questData) return { completed: 0, total: 0, totalReward: 0 };
    
    const completed = questData.Quests.filter(q => q.Done).length;
    const total = questData.Quests.length;
    const totalReward = questData.Quests.reduce((sum, q) => sum + q.Reward, 0);
    
    return { completed, total, totalReward };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-300">Đang tải quests...</p>
        </div>
      </div>
    );
  }

  if (error || !questData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={loadQuests}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const { completed, total, totalReward } = getQuestStats();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Trophy className="w-8 h-8" />
                Daily Quests
              </h1>
              <p className="text-gray-300 mt-2">Hoàn thành quests hàng ngày để nhận điểm thưởng</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-300">
                {questData.Points}
              </div>
              <div className="text-sm text-gray-300">Điểm hiện tại</div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{completed}/{total}</div>
                  <div className="text-sm text-gray-300">Quests hoàn thành</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-600 rounded-lg">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{totalReward}</div>
                  <div className="text-sm text-gray-300">Tổng điểm có thể nhận</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">24h</div>
                  <div className="text-sm text-gray-300">Reset hàng ngày</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quests Grid */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {questData.Quests.map((quest) => (
            <QuestCard
              key={quest.Code}
              quest={quest}
              onComplete={handleCompleteQuest}
              isCompleting={completingQuest === quest.Code}
            />
          ))}
        </div>

        {/* Quest Info */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Thông tin về Quests
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Cách hoạt động:</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Quests reset vào 00:00 hàng ngày (giờ VN)</li>
                <li>• Mỗi quest chỉ có thể hoàn thành 1 lần/ngày</li>
                <li>• Điểm được cộng ngay khi hoàn thành quest</li>
                <li>• Một số quest tự động hoàn thành khi bạn thực hiện hành động</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Loại quests:</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• <span className="text-blue-400">Daily</span> - Check-in hàng ngày</li>
                <li>• <span className="text-green-400">Social</span> - Tương tác với cộng đồng</li>
                <li>• <span className="text-orange-400">Event</span> - Tham gia sự kiện</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Quest Card Component
interface QuestCardProps {
  quest: QuestItem;
  onComplete: (questCode: string) => void;
  isCompleting: boolean;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, onComplete, isCompleting }) => {
  const canComplete = quest.Code === 'CHECK_IN_DAILY' && !quest.Done;
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors">
      {/* Quest Header */}
      <div className={`h-32 bg-gradient-to-br ${QuestService.getQuestColor(quest.Code)} flex items-center justify-center relative`}>
        <div className="text-6xl">{QuestService.getQuestIcon(quest.Code)}</div>
        {quest.Done && (
          <div className="absolute top-2 right-2">
            <CheckCircle className="w-6 h-6 text-green-400 fill-current" />
          </div>
        )}
      </div>

      {/* Quest Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg">{quest.Title}</h3>
          <span className={`text-xs px-2 py-1 rounded ${
            QuestService.getQuestType(quest.Code) === 'Daily' ? 'bg-blue-600' :
            QuestService.getQuestType(quest.Code) === 'Social' ? 'bg-green-600' :
            QuestService.getQuestType(quest.Code) === 'Event' ? 'bg-orange-600' :
            'bg-gray-600'
          }`}>
            {QuestService.getQuestType(quest.Code)}
          </span>
        </div>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {QuestService.getQuestDescription(quest.Code)}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">+{quest.Reward} điểm</span>
          </div>
          <div className={`text-sm font-medium ${
            quest.Done ? 'text-green-400' : 'text-gray-400'
          }`}>
            {quest.Done ? 'Hoàn thành' : 'Chưa hoàn thành'}
          </div>
        </div>

        {/* Complete Button */}
        {canComplete ? (
          <button
            onClick={() => onComplete(quest.Code)}
            disabled={isCompleting}
            className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isCompleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang hoàn thành...
              </>
            ) : (
              'Hoàn thành'
            )}
          </button>
        ) : quest.Done ? (
          <div className="w-full py-2 px-4 bg-green-600 text-white rounded-lg font-medium text-center">
            ✓ Đã hoàn thành
          </div>
        ) : (
          <div className="w-full py-2 px-4 bg-gray-700 text-gray-400 rounded-lg font-medium text-center">
            Tự động hoàn thành
          </div>
        )}
      </div>
    </div>
  );
};

export default Quests;

