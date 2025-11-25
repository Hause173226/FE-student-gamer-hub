import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, DollarSign, Globe, Building2, Search, CheckCircle } from 'lucide-react';
import { EventService } from '../services/eventService';
import { ClubService } from '../services/clubService';
import { Club } from '../types/club';
import { toast } from 'react-hot-toast';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEventModal({ isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [loadingClubs, setLoadingClubs] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mode: 'Online' as 'Online' | 'Offline',
    location: '',
    startsAt: '',
    endsAt: '',
    priceCents: '',
    capacity: '',
  });

  useEffect(() => {
    if (isOpen) {
      // Set default startsAt to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 0, 0, 0);
      setFormData(prev => ({
        ...prev,
        startsAt: tomorrow.toISOString().slice(0, 16),
      }));
      
      // Load clubs if mode is Online
      if (formData.mode === 'Online') {
        loadClubs();
      }
    }
  }, [isOpen]);

  // Load clubs when mode changes to Online
  useEffect(() => {
    if (isOpen && formData.mode === 'Online') {
      loadClubs();
    } else {
      setClubs([]);
      setSelectedClub(null);
      setSearchQuery('');
    }
  }, [formData.mode, isOpen]);

  // Search clubs with debounce
  useEffect(() => {
    if (formData.mode === 'Online' && isOpen) {
      const timer = setTimeout(() => {
        loadClubs(searchQuery);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, formData.mode, isOpen]);

  const loadClubs = async (query?: string) => {
    try {
      setLoadingClubs(true);
      const results = await ClubService.searchClubs(query);
      setClubs(results);
    } catch (error: any) {
      console.error('Error loading clubs:', error);
      toast.error('Không thể tải danh sách clubs');
    } finally {
      setLoadingClubs(false);
    }
  };

  const handleSelectClub = (club: Club) => {
    setSelectedClub(club);
    setFormData(prev => ({
      ...prev,
      location: club.name, // Set club name as location
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề sự kiện');
      return;
    }

    if (!formData.startsAt) {
      toast.error('Vui lòng chọn thời gian bắt đầu');
      return;
    }

    // Nếu là Online event, bắt buộc phải chọn club
    if (formData.mode === 'Online' && !selectedClub) {
      toast.error('Vui lòng chọn club để tổ chức sự kiện');
      return;
    }

    try {
      setLoading(true);
      
      const priceValue = formData.priceCents === '' || formData.priceCents === '0' ? 0 : parseInt(formData.priceCents.toString()) || 0;
      
      if (priceValue < 0) {
        toast.error('Giá vé không được âm');
        return;
      }

      const eventId = await EventService.createEvent({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        mode: formData.mode,
        location: formData.location.trim() || undefined,
        startsAt: new Date(formData.startsAt).toISOString(),
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : undefined,
        priceCents: priceValue, // 0 sẽ được convert thành null trong service
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      });

      // Đợi một chút để đảm bảo backend đã xử lý xong
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Tạo và mở sự kiện thành công!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Không thể tạo sự kiện');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      mode: 'Online',
      location: '',
      startsAt: '',
      endsAt: '',
      priceCents: '',
      capacity: '',
    });
    setClubs([]);
    setSelectedClub(null);
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Tạo sự kiện mới</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tiêu đề sự kiện <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Ví dụ: Giải đấu Valorant mùa 2024"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Mô tả chi tiết về sự kiện..."
            />
          </div>


          {/* Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Chế độ <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="Online"
                  checked={formData.mode === 'Online'}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value as 'Online' | 'Offline' })}
                  className="w-4 h-4 text-blue-600"
                />
                <Globe className="w-5 h-5 text-blue-400" />
                <span className="text-white">Trực tuyến</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="Offline"
                  checked={formData.mode === 'Offline'}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value as 'Online' | 'Offline' })}
                  className="w-4 h-4 text-blue-600"
                />
                <Building2 className="w-5 h-5 text-orange-400" />
                <span className="text-white">Trực tiếp</span>
              </label>
            </div>
          </div>

          {/* Location / Club Selection */}
          {formData.mode === 'Offline' ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Địa điểm
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Nhập địa điểm tổ chức"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Chọn Club <span className="text-red-500">*</span>
              </label>
              
              {/* Search Clubs */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Tìm kiếm club..."
                />
              </div>

              {/* Selected Club */}
              {selectedClub && (
                <div className="mb-3 p-3 bg-blue-600/20 border border-blue-500 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{selectedClub.name}</p>
                      {selectedClub.description && (
                        <p className="text-gray-400 text-sm mt-1 line-clamp-1">{selectedClub.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClub(null);
                        setFormData(prev => ({ ...prev, location: '' }));
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Clubs List */}
              {!selectedClub && (
                <div className="max-h-60 overflow-y-auto bg-gray-800 rounded-lg border border-gray-700">
                  {loadingClubs ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
                      Đang tải...
                    </div>
                  ) : clubs.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      {searchQuery ? 'Không tìm thấy club nào' : 'Không có club nào'}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-700">
                      {clubs.map((club) => (
                        <div
                          key={club.id}
                          className="p-3 hover:bg-gray-700/50 transition-colors cursor-pointer"
                          onClick={() => handleSelectClub(club)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-white font-medium">{club.name}</p>
                              {club.description && (
                                <p className="text-gray-400 text-xs mt-1 line-clamp-1">{club.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span>{club.membersCount || 0} thành viên</span>
                                {club.isPublic ? (
                                  <span className="text-green-400">Công khai</span>
                                ) : (
                                  <span className="text-orange-400">Riêng tư</span>
                                )}
                              </div>
                            </div>
                            <div className="ml-4">
                              {club.isJoined && (
                                <div className="flex items-center gap-2 text-green-400 text-sm">
                                  <CheckCircle className="w-5 h-5" />
                                  <span>Đã tham gia</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thời gian bắt đầu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thời gian kết thúc (tùy chọn)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="datetime-local"
                  value={formData.endsAt}
                  onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                  className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Price & Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Giá vé (VNĐ) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={formData.priceCents}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string, or only digits
                    if (value === '' || /^\d+$/.test(value)) {
                      setFormData({ ...formData, priceCents: value });
                    }
                  }}
                  onBlur={(e) => {
                    // If empty on blur, set to empty string (will be treated as 0)
                    if (e.target.value === '') {
                      setFormData({ ...formData, priceCents: '' });
                    }
                  }}
                  className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="0 = Miễn phí"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Nhập 0 nếu sự kiện miễn phí
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Số lượng người tham gia tối đa (tùy chọn)
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Không giới hạn"
                  min="1"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tạo...
                </>
              ) : (
                'Tạo sự kiện'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


