import React, { useEffect, useState } from 'react';
import { X, Calendar, MapPin, Users, Clock, Globe, Building2, CheckCircle, XCircle, AlertCircle, Trophy, Gamepad2, GraduationCap } from 'lucide-react';
import { EventService, Event } from '../services/eventService';
import { ClubService } from '../services/clubService';
import { Club } from '../types/club';
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
  const [detailEvent, setDetailEvent] = useState<Event | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [clubInfo, setClubInfo] = useState<Club | null>(null);
  const [loadingClub, setLoadingClub] = useState(false);
  const [joiningClub, setJoiningClub] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Trigger animation
      setTimeout(() => setIsAnimating(true), 10);
      
      // Load chi tiết event từ API
      if (event?.id) {
        loadEventDetail(event.id);
      } else {
        setDetailEvent(event);
        // Nếu event là Online và có location, load club
        if (event?.mode === 'Online' && event?.location) {
          loadClubByName(event.location);
        }
      }
    } else {
      setIsAnimating(false);
      setDetailEvent(null);
      setClubInfo(null);
    }
  }, [isOpen, event?.id]);

  const loadEventDetail = async (eventId: string) => {
    try {
      setLoadingDetail(true);
      const eventDetail = await EventService.getEventById(eventId);
      setDetailEvent(eventDetail);
      
      // Nếu event là Online và có location (có thể là tên club), tìm club
      if (eventDetail.mode === 'Online' && eventDetail.location) {
        await loadClubByName(eventDetail.location);
      } else {
        setClubInfo(null);
      }
    } catch (error: any) {
      console.error('Error loading event detail:', error);
      // Nếu lỗi, vẫn hiển thị event từ props
      setDetailEvent(event);
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadClubByName = async (clubName: string) => {
    try {
      setLoadingClub(true);
      // Search clubs by name
      const clubs = await ClubService.searchClubs(clubName);
      // Tìm club có tên khớp chính xác (case-insensitive)
      const foundClub = clubs.find(
        club => club.name.toLowerCase().trim() === clubName.toLowerCase().trim()
      );
      
      if (foundClub) {
        // Reload club detail để lấy trạng thái IsMember chính xác
        try {
          const clubDetail = await ClubService.getClubById(foundClub.id.toString());
          setClubInfo(clubDetail);
        } catch (detailError) {
          // Nếu không lấy được detail, dùng thông tin từ search
          setClubInfo(foundClub);
        }
      } else {
        setClubInfo(null);
      }
    } catch (error: any) {
      console.error('Error loading club:', error);
      setClubInfo(null);
    } finally {
      setLoadingClub(false);
    }
  };

  const handleJoinClub = async () => {
    if (!clubInfo || joiningClub) return;
    
    try {
      setJoiningClub(true);
      await ClubService.joinClub(clubInfo.id.toString());
      toast.success(`Tham gia club "${clubInfo.name}" thành công!`, {
        duration: 4000,
      });
      
      // Reload club detail để cập nhật trạng thái IsMember
      try {
        const updatedClub = await ClubService.getClubById(clubInfo.id.toString());
        setClubInfo(updatedClub);
      } catch (reloadError) {
        // Nếu không reload được, thử reload bằng tên
        if (detailEvent?.location) {
          await loadClubByName(detailEvent.location);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể tham gia club');
    } finally {
      setJoiningClub(false);
    }
  };

  if (!isOpen || !event) return null;
  
  // Sử dụng detailEvent nếu có, nếu không dùng event từ props
  const displayEvent = detailEvent || event;

  const handleRegister = async () => {
    if (!displayEvent) return;
    
    // Nếu event là Online và có club, kiểm tra xem user đã join club chưa
    if (displayEvent.mode === 'Online' && displayEvent.location && clubInfo && !clubInfo.isJoined) {
      toast.error(`Bạn phải tham gia vào club "${clubInfo.name}" để tham gia sự kiện`, {
        duration: 5000,
      });
      return;
    }
    
    try {
      setLoading(true);
      await EventService.registerEvent(displayEvent.id);
      toast.success('Đăng ký thành công!');
      // Reload chi tiết sau khi đăng ký
      await loadEventDetail(displayEvent.id);
      onRegister?.();
    } catch (error: any) {
      toast.error(error.message || 'Không thể đăng ký sự kiện');
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!displayEvent) return;
    try {
      setLoading(true);
      await EventService.unregisterEvent(displayEvent.id);
      toast.success('Đã hủy đăng ký!');
      // Reload chi tiết sau khi hủy đăng ký
      await loadEventDetail(displayEvent.id);
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
              {loadingDetail ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-gray-400">Đang tải chi tiết...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    {getEventTypeIcon(displayEvent.eventType)}
                    <h2 className="text-2xl font-bold text-white">{displayEvent.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(displayEvent.status)}
                    <span className={`text-sm font-medium ${EventService.getEventStatusColor(displayEvent.status)}`}>
                      {displayEvent.displayStatus || displayEvent.status}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-400 capitalize">
                      {displayEvent.eventType} • {displayEvent.mode}
                    </span>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors ml-4"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          {loadingDetail ? (
            <div className="p-6 text-center">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Đang tải thông tin chi tiết...</p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Description */}
              {displayEvent.description && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Mô tả</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{displayEvent.description}</p>
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
                  Bắt đầu: {EventService.formatEventDate(displayEvent.startDate)}
                </p>
                {displayEvent.endDate && (
                  <p className="text-gray-300 text-sm mt-1">
                    Kết thúc: {EventService.formatEventDate(displayEvent.endDate)}
                  </p>
                )}
              </div>

              {/* Location/Mode */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  {displayEvent.mode === 'Online' ? (
                    <Globe className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Building2 className="w-5 h-5 text-orange-400" />
                  )}
                  <h3 className="font-semibold text-white">
                    {displayEvent.mode === 'Online' ? 'Trực tuyến' : 'Địa điểm'}
                  </h3>
                </div>
                {displayEvent.location ? (
                  <p className="text-gray-300 text-sm">{displayEvent.location}</p>
                ) : (
                  <p className="text-gray-400 text-sm">Chưa có thông tin</p>
                )}
              </div>

              {/* Club Info (for Online events) */}
              {displayEvent.mode === 'Online' && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Gamepad2 className="w-5 h-5 text-purple-400" />
                      <h3 className="font-semibold text-white">Club cần tham gia</h3>
                    </div>
                  {loadingClub ? (
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-sm">Đang tải thông tin club...</span>
                    </div>
                  ) : clubInfo ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-white font-semibold text-lg mb-1">{clubInfo.name}</p>
                          {clubInfo.description && (
                            <p className="text-gray-400 text-sm mt-1 line-clamp-2">{clubInfo.description}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                            <span>{clubInfo.membersCount || 0} thành viên</span>
                            {clubInfo.isPublic ? (
                              <span className="text-green-400">Công khai</span>
                            ) : (
                              <span className="text-orange-400">Riêng tư</span>
                            )}
                          </div>
                        </div>
                        {clubInfo.isJoined ? (
                          <div className="flex items-center gap-2 text-green-400 text-sm pt-2 border-t border-gray-600">
                            <CheckCircle className="w-5 h-5" />
                            <span>Bạn đã tham gia club "{clubInfo.name}"</span>
                          </div>
                        ) : (
                          <button
                            onClick={handleJoinClub}
                            disabled={joiningClub}
                            className="w-full mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {joiningClub ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Đang tham gia...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Tham gia club "{clubInfo.name}" để tham gia sự kiện
                              </>
                            )}
                          </button>
                        )}
                      </div>
                  ) : displayEvent.location ? (
                    <p className="text-gray-400 text-sm">
                      Không tìm thấy club "{displayEvent.location}"
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm">Chưa có club được chọn</p>
                  )}
                </div>
              )}

              {/* Participants */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-white">Người tham gia</h3>
                </div>
                <p className="text-gray-300 text-sm">
                  {displayEvent.currentParticipants || 0}
                  {displayEvent.maxParticipants && ` / ${displayEvent.maxParticipants}`} người đã đăng ký
                </p>
                {displayEvent.confirmedCount !== undefined && displayEvent.confirmedCount > 0 && (
                  <p className="text-gray-400 text-xs mt-1">
                    Đã xác nhận: {displayEvent.confirmedCount} người
                  </p>
                )}
                {displayEvent.maxParticipants && (
                  <div className="mt-2 w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((displayEvent.currentParticipants / displayEvent.maxParticipants) * 100, 100)}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Price */}
              {displayEvent.priceCents !== undefined && displayEvent.priceCents > 0 && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <h3 className="font-semibold text-white">Phí tham gia</h3>
                  </div>
                  <p className="text-gray-300 text-lg font-semibold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayEvent.priceCents)}
                  </p>
                </div>
              )}

              {/* Organizer */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Người tổ chức</h3>
                </div>
                <p className="text-gray-300 text-sm">{displayEvent.organizerName || 'Chưa có thông tin'}</p>
              </div>
            </div>

            {/* Community (if exists) */}
            {displayEvent.communityName && (
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">Community</h3>
                <p className="text-gray-300 text-sm">{displayEvent.communityName}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-700">
              {displayEvent.status === 'Open' && (
                <>
                  {displayEvent.isRegistered ? (
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
                      disabled={loading || (displayEvent.maxParticipants && displayEvent.currentParticipants >= displayEvent.maxParticipants)}
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
          )}
        </div>
      </div>
    </>
  );
}


