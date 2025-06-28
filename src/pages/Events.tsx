import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Trophy, 
  Star,
  Plus,
  Filter,
  Search,
  Bell,
  Heart,
  Share,
  ExternalLink,
  Award,
  Target,
  Zap
} from 'lucide-react';

export function Events() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcomingEvents = [
    {
      id: 1,
      title: 'FPT Valorant Championship 2024',
      description: 'Giải đấu Valorant lớn nhất FPT University với tổng giải thưởng 50 triệu VNĐ',
      date: '2024-02-15',
      time: '19:00',
      duration: '3 giờ',
      location: 'FPT University HCM',
      organizer: 'FPT Esports Club',
      participants: 64,
      maxParticipants: 64,
      prize: '50,000,000 VNĐ',
      status: 'Đang đăng ký',
      image: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg?auto=compress&cs=tinysrgb&w=400',
      tags: ['Valorant', 'Tournament', 'Prize Pool'],
      isRegistered: false,
      featured: true
    },
    {
      id: 2,
      title: 'HCMUT League of Legends Weekly',
      description: 'Giải đấu hàng tuần dành cho sinh viên HCMUT',
      date: '2024-02-10',
      time: '20:00',
      duration: '2 giờ',
      location: 'Online',
      organizer: 'HCMUT Gaming',
      participants: 32,
      maxParticipants: 40,
      prize: 'Trophy + XP',
      status: 'Còn chỗ',
      tags: ['League of Legends', 'Weekly', 'Online'],
      isRegistered: true,
      featured: false
    },
    {
      id: 3,
      title: 'Vietnam Student Gaming Meetup',
      description: 'Buổi gặp mặt offline game thủ sinh viên toàn quốc',
      date: '2024-02-20',
      time: '14:00',
      duration: '6 giờ',
      location: 'Lotte Center Hanoi',
      organizer: 'VN Student Gamers',
      participants: 156,
      maxParticipants: 200,
      prize: 'Networking + Gifts',
      status: 'Còn chỗ',
      tags: ['Meetup', 'Offline', 'Networking'],
      isRegistered: false,
      featured: false
    }
  ];

  const myEvents = [
    {
      id: 4,
      title: 'FPT Dota 2 Scrimmage',
      date: '2024-02-08',
      time: '21:00',
      status: 'Đã tham gia',
      result: 'Thắng',
      placement: '2nd Place'
    },
    {
      id: 5,
      title: 'UEH Mobile Legends Cup',
      date: '2024-01-25',
      time: '18:30',
      status: 'Đã tham gia',
      result: 'Thua',
      placement: '8th Place'
    }
  ];

  const tabs = [
    { id: 'upcoming', label: 'Sắp diễn ra', count: upcomingEvents.length },
    { id: 'my-events', label: 'Sự kiện của tôi', count: myEvents.length },
    { id: 'create', label: 'Tạo sự kiện', count: null }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đang đăng ký': return 'bg-emerald-500/20 text-emerald-400';
      case 'Còn chỗ': return 'bg-blue-500/20 text-blue-400';
      case 'Đầy': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
          Sự kiện & Giải đấu 🏆
        </h1>
        <p className="text-gray-400">Tham gia các giải đấu và sự kiện esports hấp dẫn</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm sự kiện theo tên, game, địa điểm..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
            <Filter className="w-5 h-5" />
            <span>Lọc</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
            <Plus className="w-5 h-5" />
            <span>Tạo sự kiện</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count && (
              <span className="bg-gray-600 text-xs px-2 py-1 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'upcoming' && (
        <div className="space-y-6">
          {/* Featured Event */}
          {upcomingEvents.filter(e => e.featured).map((event) => (
            <div key={event.id} className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-xl border border-purple-500/30 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                      ⭐ FEATURED
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                      <Heart className="w-5 h-5 text-gray-400 hover:text-red-400" />
                    </button>
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                      <Share className="w-5 h-5 text-gray-400 hover:text-white" />
                    </button>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-3">{event.title}</h2>
                    <p className="text-gray-300 mb-4">{event.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3 text-gray-300">
                        <Calendar className="w-5 h-5 text-indigo-400" />
                        <span>{event.date} lúc {event.time}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-300">
                        <Clock className="w-5 h-5 text-indigo-400" />
                        <span>Thời gian: {event.duration}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-300">
                        <MapPin className="w-5 h-5 text-indigo-400" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-300">
                        <Users className="w-5 h-5 text-indigo-400" />
                        <span>{event.participants}/{event.maxParticipants} người tham gia</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-300">
                        <Trophy className="w-5 h-5 text-indigo-400" />
                        <span>Giải thưởng: {event.prize}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {event.tags.map((tag, index) => (
                        <span key={index} className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex space-x-3">
                      <button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all">
                        Đăng ký ngay
                      </button>
                      <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors">
                        <Bell className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-64 lg:h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-sm opacity-80">Tổ chức bởi</p>
                      <p className="font-medium">{event.organizer}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Regular Events */}
          <div className="grid lg:grid-cols-2 gap-6">
            {upcomingEvents.filter(e => !e.featured).map((event) => (
              <div key={event.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                      <Heart className="w-4 h-4 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{event.description}</p>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>{event.date} • {event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>{event.participants}/{event.maxParticipants} người</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {event.tags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <button className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    event.isRegistered
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}>
                    {event.isRegistered ? 'Đã đăng ký' : 'Đăng ký'}
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'my-events' && (
        <div className="space-y-4">
          {myEvents.map((event) => (
            <div key={event.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date} • {event.time}</span>
                    </div>
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs">{event.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center space-x-2 mb-1 ${
                    event.result === 'Thắng' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {event.result === 'Thắng' ? (
                      <Trophy className="w-5 h-5" />
                    ) : (
                      <Target className="w-5 h-5" />
                    )}
                    <span className="font-bold">{event.result}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{event.placement}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Tạo sự kiện mới</h2>
            
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Tên sự kiện</label>
                <input
                  type="text"
                  placeholder="VD: FPT Valorant Championship 2024"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Mô tả</label>
                <textarea
                  rows={4}
                  placeholder="Mô tả chi tiết về sự kiện của bạn..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Ngày</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Giờ</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Địa điểm</label>
                <input
                  type="text"
                  placeholder="VD: FPT University HCM hoặc Online"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Số người tối đa</label>
                  <input
                    type="number"
                    placeholder="64"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Giải thưởng</label>
                  <input
                    type="text"
                    placeholder="VD: 10,000,000 VNĐ"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Lưu nháp
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Tạo sự kiện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}