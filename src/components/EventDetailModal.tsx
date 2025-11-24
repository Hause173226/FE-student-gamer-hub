import React, { useEffect, useState } from 'react';
import { X, Calendar, MapPin, Users, Clock, Globe, Building2, CheckCircle, XCircle, AlertCircle, Trophy, Gamepad2, GraduationCap } from 'lucide-react';
import { EventService, Event } from '../services/eventService';
import { toast } from 'react-hot-toast';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onRegister?: () => void;
  onUnregister?: () => void;
}

export function EventDetailModal({ isOpen, onClose, event, onRegister, onUnregister }: EventDetailModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const handleRegister = async () => {
    if (!event) return;
    try {
      setLoading(true);
      await EventService.registerEvent(event.id);
      toast.success('Đăng ký thành công!');
      onRegister?.();
    } catch (error: any) {
      toast.error(error.message || 'Không thể đăng ký sự kiện');
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!event) return;
    try {
      setLoading(true);
      await EventService.unregisterEvent(event.id);
      toast.success('Đã hủy đăng ký!');
      onUnregister?.();
    } catch (error: any) {
      toast.error(error.message || 'Không thể hủy đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType?.toLowerCase()) {
      case 'tournament':
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 'meetup':
        return <Users className="w-6 h-6 text-blue-500" />;
      case 'workshop':
        return <GraduationCap className="w-6 h-6 text-green-500" />;
      default:
        return <Calendar className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'closed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
      case 'cancelled':
      case 'canceled':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'draft':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none ${
          isAnimating ? 'pointer-events-auto' : ''
        }`}
      >
        <div
          className={`bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
            isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
          } pointer-events-auto`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-start justify-between z-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getEventTypeIcon(event.eventType)}
                <h2 className="text-2xl font-bold text-white">{event.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(event.status)}
                <span className={`text-sm font-medium ${EventService.getEventStatusColor(event.status)}`}>
                  {event.status}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-400 capitalize">
                  {event.eventType} • {event.mode}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors ml-4"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            {event.description && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Mô tả</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date & Time */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Thời gian</h3>
                </div>
                <p className="text-gray-300 text-sm">
                  Bắt đầu: {EventService.formatEventDate(event.startDate)}
                </p>
                {event.endDate && (
                  <p className="text-gray-300 text-sm mt-1">
                    Kết thúc: {EventService.formatEventDate(event.endDate)}
                  </p>
                )}
              </div>

              {/* Location/Mode */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  {event.mode === 'Online' ? (
                    <Globe className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Building2 className="w-5 h-5 text-orange-400" />
                  )}
                  <h3 className="font-semibold text-white">
                    {event.mode === 'Online' ? 'Trực tuyến' : 'Địa điểm'}
                  </h3>
                </div>
                {event.location ? (
                  <p className="text-gray-300 text-sm">{event.location}</p>
                ) : (
                  <p className="text-gray-400 text-sm">Chưa có thông tin</p>
                )}
              </div>

              {/* Participants */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-white">Người tham gia</h3>
                </div>
                <p className="text-gray-300 text-sm">
                  {event.currentParticipants}
                  {event.maxParticipants && ` / ${event.maxParticipants}`} người
                </p>
                {event.maxParticipants && (
                  <div className="mt-2 w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((event.currentParticipants / event.maxParticipants) * 100, 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Organizer */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Người tổ chức</h3>
                </div>
                <p className="text-gray-300 text-sm">{event.organizerName}</p>
              </div>
            </div>

            {/* Community (if exists) */}
            {event.communityName && (
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Community</h3>
                <p className="text-gray-300 text-sm">{event.communityName}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-700">
              {event.status === 'Open' && (
                <>
                  {event.isRegistered ? (
                    <button
                      disabled
                      className="flex-1 bg-green-600/50 text-green-300 px-6 py-3 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Đã đăng ký
                    </button>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={loading || (event.maxParticipants && event.currentParticipants >= event.maxParticipants)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Đăng ký tham gia
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
              <button
                onClick={onClose}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


