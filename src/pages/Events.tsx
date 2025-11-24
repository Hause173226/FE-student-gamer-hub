import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Trophy, Gamepad2, GraduationCap, Coffee, Globe, Building2, Search, Filter, ChevronRight, CheckCircle, XCircle, AlertCircle, Plus, Edit, Trash2, Play, X as XIcon } from 'lucide-react';
import { EventService, Event, EventFilters } from '../services/eventService';
import { MembershipService } from '../services/membershipService';
import { CreateEventModal } from '../components/CreateEventModal';
import { EditEventModal } from '../components/EditEventModal';
import { EventDetailModal } from '../components/EventDetailModal';
import { toast } from 'react-hot-toast';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EventFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [canCreateEvent, setCanCreateEvent] = useState<boolean>(false);
  const [membershipInfo, setMembershipInfo] = useState<{
    hasMembership: boolean;
    isExpired: boolean;
    isUnlimited: boolean;
    remainingQuota: number | null;
    planName: string;
  } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [showMyEvents, setShowMyEvents] = useState(false);

  // Event types for filter
  const eventTypes = [
    { value: '', label: 'Tất cả loại', icon: '📅' },
    { value: 'Tournament', label: 'Giải đấu', icon: '🏆' },
    { value: 'Meetup', label: 'Gặp gỡ', icon: '👥' },
    { value: 'Workshop', label: 'Workshop', icon: '🎓' },
    { value: 'Online', label: 'Online', icon: '💻' },
    { value: 'Offline', label: 'Offline', icon: '🏢' }
  ];

  const modes = [
    { value: '', label: 'Tất cả chế độ' },
    { value: 'Online', label: 'Trực tuyến' },
    { value: 'Offline', label: 'Trực tiếp' }
  ];

  // Debounce search term and filters - auto search after user stops typing
  useEffect(() => {
    if (showMyEvents) return; // Don't auto-search when viewing my events
    
    const timer = setTimeout(() => {
      // Update filters based on current search and filter values
      const eventFilters: EventFilters = {
        search: searchTerm || undefined,
        eventType: selectedEventType || undefined,
        mode: selectedMode || undefined,
      };
      
      // Load events with updated filters
      const fetchEvents = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await EventService.getAllEvents(eventFilters);
          setEvents(response.items);
        } catch (err: any) {
          setError(err.message || 'Không thể tải danh sách sự kiện');
          toast.error(err.message || 'Không thể tải danh sách sự kiện');
        } finally {
          setLoading(false);
        }
      };
      
      fetchEvents();
    }, 500); // 500ms delay after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm, selectedEventType, selectedMode, showMyEvents]);

  // Load events when switching between "All Events" and "My Events"
  useEffect(() => {
    checkMembershipAndQuota();
    if (showMyEvents) {
      loadMyEvents();
    } else {
      loadEvents();
    }
  }, [showMyEvents]);

  const checkMembershipAndQuota = async () => {
    try {
      const membership = await MembershipService.getMyMembership();
      
      if (!membership) {
        setCanCreateEvent(false);
        setMembershipInfo({
          hasMembership: false,
          isExpired: false,
          isUnlimited: false,
          remainingQuota: null,
          planName: '',
        });
        return;
      }

      const now = new Date();
      const endDate = new Date(membership.EndDate);
      const isExpired = endDate < now;
      const isUnlimited = membership.MonthlyEventLimit === -1;
      const remainingQuota = membership.RemainingEventQuota;

      const canCreate = !isExpired && (isUnlimited || (remainingQuota !== null && remainingQuota > 0));

      setCanCreateEvent(canCreate);
      setMembershipInfo({
        hasMembership: true,
        isExpired,
        isUnlimited,
        remainingQuota,
        planName: membership.PlanName,
      });
    } catch (error) {
      console.error('Error checking membership:', error);
      setCanCreateEvent(false);
      setMembershipInfo(null);
    }
  };

  const loadMyEvents = async () => {
    try {
      const response = await EventService.getMyEvents();
      setMyEvents(response.items);
    } catch (error: any) {
      console.error('Error loading my events:', error);
      toast.error('Không thể tải danh sách sự kiện của bạn');
    }
  };

  const handleCreateSuccess = () => {
    loadEvents();
    checkMembershipAndQuota();
    if (showMyEvents) {
      loadMyEvents();
    }
  };

  const handleOpenEvent = async (eventId: string) => {
    try {
      await EventService.openEvent(eventId);
      toast.success('Đã mở sự kiện thành công!');
      loadEvents();
      if (showMyEvents) {
        loadMyEvents();
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể mở sự kiện');
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy sự kiện này? Người tham gia sẽ được hoàn tiền.')) {
      return;
    }
    try {
      await EventService.cancelEvent(eventId);
      toast.success('Đã hủy sự kiện thành công!');
      loadEvents();
      if (showMyEvents) {
        loadMyEvents();
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể hủy sự kiện');
    }
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const eventFilters: EventFilters = {
        ...filters,
        search: searchTerm || undefined,
        eventType: selectedEventType || undefined,
        mode: selectedMode || undefined
      };
      
      const response = await EventService.getAllEvents(eventFilters);
      setEvents(response.items);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách sự kiện');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEvent = async (eventId: string) => {
    try {
      await EventService.registerEvent(eventId);
      toast.success('Đăng ký sự kiện thành công!');
      
      // Update local state
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, isRegistered: true, currentParticipants: event.currentParticipants + 1 }
            : event
        )
      );
    } catch (err: any) {
      toast.error(err.message || 'Không thể đăng ký sự kiện');
    }
  };

  const handleUnregisterEvent = async (eventId: string) => {
    try {
      await EventService.unregisterEvent(eventId);
      toast.success('Hủy đăng ký thành công!');
      
      // Update local state
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, isRegistered: false, currentParticipants: event.currentParticipants - 1 }
            : event
        )
      );
    } catch (err: any) {
      toast.error(err.message || 'Không thể hủy đăng ký');
    }
  };


  const clearFilters = () => {
    setSearchTerm('');
    setSelectedEventType('');
    setSelectedMode('');
    setFilters({});
  };

  const getEventStatusIcon = (status: string) => {
    if (!status || typeof status !== 'string') {
      return <Clock className="w-4 h-4 text-gray-500" />;
    }
    
    switch (status.toLowerCase()) {
      case 'open':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      case 'cancelled':
      case 'canceled':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    if (!eventType || typeof eventType !== 'string') {
      return <Calendar className="w-5 h-5 text-gray-500" />;
    }
    
    switch (eventType.toLowerCase()) {
      case 'tournament':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'meetup':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'workshop':
        return <GraduationCap className="w-5 h-5 text-green-500" />;
      case 'online':
        return <Globe className="w-5 h-5 text-purple-500" />;
      case 'offline':
        return <Building2 className="w-5 h-5 text-orange-500" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-6">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Lỗi tải sự kiện</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={loadEvents}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sự Kiện Gaming</h1>
            <p className="text-gray-400">Khám phá và tham gia các sự kiện gaming thú vị</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMyEvents(!showMyEvents)}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Calendar className="w-4 h-4" />
              {showMyEvents ? 'Tất cả sự kiện' : 'Sự kiện của tôi'}
            </button>
            {canCreateEvent ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Tạo sự kiện
              </button>
            ) : (
            <div className="text-right">
              {!membershipInfo?.hasMembership ? (
                <div className="text-sm text-gray-400">
                  <p>Bạn cần đăng ký gói membership để tạo event</p>
                  <button
                    onClick={() => {
                      // Navigate to membership page
                      window.location.href = '/membership';
                    }}
                    className="text-blue-400 hover:text-blue-300 mt-1 underline"
                  >
                    Đăng ký ngay
                  </button>
                </div>
              ) : membershipInfo.isExpired ? (
                <div className="text-sm text-gray-400">
                  <p>Gói membership của bạn đã hết hạn</p>
                  <button
                    onClick={() => {
                      window.location.href = '/membership';
                    }}
                    className="text-blue-400 hover:text-blue-300 mt-1 underline"
                  >
                    Gia hạn ngay
                  </button>
                </div>
              ) : !membershipInfo.isUnlimited && membershipInfo.remainingQuota !== null && membershipInfo.remainingQuota <= 0 ? (
                <div className="text-sm text-gray-400">
                  <p>Bạn đã hết quota tạo event trong tháng này</p>
                  <p className="text-xs mt-1">Gói: {membershipInfo.planName}</p>
                </div>
              ) : null}
            </div>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sự kiện (tự động tìm kiếm)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
            >
              <Filter className="w-5 h-5" />
              Bộ lọc
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Event Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Loại sự kiện
                  </label>
                  <select
                    value={selectedEventType}
                    onChange={(e) => setSelectedEventType(e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    {eventTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mode Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chế độ
                  </label>
                  <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    {modes.map((mode) => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Events Grid */}
        {showMyEvents ? (
          myEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Bạn chưa tạo sự kiện nào</h3>
              <p className="text-gray-400">Tạo sự kiện đầu tiên của bạn ngay!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map((event) => (
                <div key={event.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors flex flex-col h-full">
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getEventTypeIcon(event.eventType)}
                        <div>
                          <h3 className="text-lg font-semibold text-white line-clamp-2">
                            {event.title}
                          </h3>
                          <p className="text-sm text-gray-400 capitalize">
                            {event.eventType} • {event.mode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getEventStatusIcon(event.status)}
                        <span className={`text-xs font-medium ${EventService.getEventStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>{EventService.formatEventDate(event.startDate)}</span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>
                          {event.currentParticipants}
                          {event.maxParticipants && ` / ${event.maxParticipants}`} người tham gia
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons for Organizer */}
                    <div className="flex gap-2 flex-wrap mt-auto">
                      {(event.status === 'Draft' || event.status === 'Open') && (
                        <button
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEditModal(true);
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Chỉnh sửa
                        </button>
                      )}
                      {event.status === 'Draft' && (
                        <button
                          onClick={() => handleOpenEvent(event.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <Play className="w-4 h-4" />
                          Mở sự kiện
                        </button>
                      )}
                      {event.status !== 'Cancelled' && event.status !== 'Completed' && (
                        <button
                          onClick={() => handleCancelEvent(event.id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          <XIcon className="w-4 h-4" />
                          Hủy sự kiện
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Không có sự kiện nào</h3>
            <p className="text-gray-400">Thử thay đổi bộ lọc để tìm thêm sự kiện</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors flex flex-col h-full">
                {/* Event Header */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getEventTypeIcon(event.eventType)}
                      <div>
                        <h3 className="text-lg font-semibold text-white line-clamp-2">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-400 capitalize">
                          {event.eventType} • {event.mode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Event Description */}
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{EventService.formatEventDate(event.startDate)}</span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>
                        {event.currentParticipants}
                        {event.maxParticipants && ` / ${event.maxParticipants}`} người tham gia
                      </span>
                    </div>
                  </div>

                  {/* Community */}
                  {event.communityName && (
                    <div className="mb-4">
                      <span className="inline-block bg-blue-600/20 text-blue-400 text-xs px-2 py-1 rounded">
                        {event.communityName}
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto">
                    {/* Organizer: Show "Bạn là người host" message and Detail button only */}
                    {event.isOrganizer && (
                      <>
                        <div className="flex-1 flex items-center text-sm text-gray-400">
                          Bạn là người host
                        </div>
                        <button
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowDetailModal(true);
                          }}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          Chi tiết
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Regular User: Show Register/Unregister only if event is Open */}
                    {!event.isOrganizer && event.status === 'Open' && (
                      <>
                        {event.isRegistered ? (
                          <button
                            disabled
                            className="flex-1 bg-green-600/50 text-green-300 px-4 py-2 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Đã đăng ký
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegisterEvent(event.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Đăng ký
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowDetailModal(true);
                          }}
                          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          Chi tiết
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Detail Button for non-Open events (non-organizer) */}
                    {!event.isOrganizer && event.status !== 'Open' && (
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowDetailModal(true);
                        }}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        Chi tiết
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Event Modal */}
        <CreateEventModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />

        {/* Edit Event Modal */}
        <EditEventModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
          }}
          onSuccess={handleCreateSuccess}
          event={selectedEvent}
        />

        {/* Event Detail Modal */}
        <EventDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          onRegister={() => {
            loadEvents();
            if (showMyEvents) {
              loadMyEvents();
            }
          }}
          onUnregister={() => {
            loadEvents();
            if (showMyEvents) {
              loadMyEvents();
            }
          }}
        />
      </div>
    </div>
  );
};

export default Events;