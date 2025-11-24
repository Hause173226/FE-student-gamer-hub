import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, DollarSign, Globe, Building2 } from 'lucide-react';
import { EventService } from '../services/eventService';
import { toast } from 'react-hot-toast';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEventModal({ isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const [loading, setLoading] = useState(false);
  
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
    }
  }, [isOpen]);

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

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {formData.mode === 'Offline' ? 'Địa điểm' : 'Link/URL (tùy chọn)'}
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder={formData.mode === 'Offline' ? 'Nhập địa điểm tổ chức' : 'Nhập link/URL sự kiện (nếu có)'}
              />
            </div>
          </div>

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


