import { authAxiosInstance } from './axiosInstance';
import { API_CONFIG } from '../config/apiConfig';

export interface Event {
  id: string;
  title: string;
  description: string;
  eventType: 'Tournament' | 'Meetup' | 'Workshop' | 'Online' | 'Offline';
  mode: 'Online' | 'Offline';
  startDate: string;
  endDate: string;
  maxParticipants?: number;
  currentParticipants: number;
  registeredCount?: number;
  confirmedCount?: number;
  isRegistered: boolean;
  isOrganizer?: boolean;
  communityId?: string;
  communityName?: string;
  organizerId: string;
  organizerName?: string;
  status: 'Open' | 'Closed' | 'Completed' | 'Cancelled' | 'Draft';
  displayStatus?: string;
  registrationDeadline?: string;
  location?: string;
  priceCents?: number;
  requirements?: string[];
  prizes?: string[];
  rules?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  eventId: string;
  userId: string;
  registeredAt: string;
  status: 'Registered' | 'Cancelled';
}

export interface EventFilters {
  eventType?: string;
  mode?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface EventListResponse {
  items: Event[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export class EventService {
  static async getAllEvents(filters?: EventFilters): Promise<EventListResponse> {
    try {
      console.log('🔄 Fetching all events...');
      
      const params = new URLSearchParams();
      if (filters?.eventType) params.append('eventType', filters.eventType);
      if (filters?.mode) params.append('mode', filters.mode);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      
      const response = await authAxiosInstance.get(
        `${API_CONFIG.ENDPOINTS.EVENTS.BASE}?${params.toString()}`
      );
      
      console.log('✅ Events fetched:', response.data);
      
      const apiData = response.data;
      const items = apiData.Items || apiData.items || [];
      
      const transformedItems = items.map((event: any) => this.transformEvent(event));
      
      return {
        items: transformedItems,
        totalCount: transformedItems.length,
        page: 1,
        pageSize: apiData.Size || 20,
        totalPages: 1,
        hasNext: !!apiData.NextCursor,
        hasPrevious: !!apiData.PrevCursor
      };
    } catch (error: any) {
      console.error('❌ Error fetching events:', error);
      throw new Error('Không thể tải danh sách sự kiện');
    }
  }

  static async getEventById(eventId: string): Promise<Event> {
    try {
      console.log('🔄 Fetching event detail by ID:', eventId);
      
      const response = await authAxiosInstance.get(
        `${API_CONFIG.ENDPOINTS.EVENTS.BASE}/${eventId}`
      );
      
      console.log('✅ Event detail fetched:', response.data);
      return this.transformEvent(response.data);
    } catch (error: any) {
      console.error('❌ Error fetching event detail:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy sự kiện');
      } else if (error.response?.status === 401) {
        throw new Error('Bạn cần đăng nhập để xem chi tiết sự kiện');
      } else {
        throw new Error('Không thể tải thông tin sự kiện');
      }
    }
  }

  static async getEventParticipantCount(eventId: string): Promise<number> {
    try {
      const response = await authAxiosInstance.get(
        `/api/events/${eventId}/registrations?pageSize=1&page=1`
      );
      
      const total = response.data?.Total || response.data?.total || 0;
      return total;
    } catch (error: any) {
      console.error('❌ Error getting participant count:', error);
      return 0;
    }
  }

  static async registerEvent(eventId: string): Promise<EventRegistration> {
    try {
      console.log('🔄 Registering for event:', eventId);
      
      const response = await authAxiosInstance.post(
        `/api/events/${eventId}/registrations`
      );
      
      console.log('✅ Event registration successful:', response.data);
      
      return {
        eventId,
        userId: response.data.userId || '',
        registeredAt: new Date().toISOString(),
        status: 'Registered'
      };
    } catch (error: any) {
      console.error('❌ Error registering for event:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 409) {
        throw new Error('Bạn đã đăng ký sự kiện này rồi');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Sự kiện đã đóng đăng ký hoặc đã đầy';
        throw new Error(errorMessage);
      } else if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || error.response?.data?.title || 'Bạn không có quyền đăng ký sự kiện này';
        throw new Error(errorMessage);
      } else if (error.response?.status === 404) {
        throw new Error('Không tìm thấy sự kiện');
      } else {
        const errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || 'Không thể đăng ký sự kiện';
        throw new Error(errorMessage);
      }
    }
  }

  static async unregisterEvent(eventId: string): Promise<void> {
    try {
      console.log('🔄 Unregistering from event:', eventId);
      
      await authAxiosInstance.delete(
        `${API_CONFIG.ENDPOINTS.EVENTS.BASE}/${eventId}/unregister`
      );
      
      console.log('✅ Event unregistration successful');
    } catch (error: any) {
      console.error('❌ Error unregistering from event:', error);
      throw new Error('Không thể hủy đăng ký sự kiện');
    }
  }

  static async createEvent(data: {
    communityId?: string;
    title: string;
    description?: string;
    mode: 'Online' | 'Offline';
    location?: string;
    startsAt: string;
    endsAt?: string;
    priceCents: number;
    capacity?: number;
  }): Promise<string> {
    try {
      console.log('🔄 Creating event...', data);
      
      const modeValue = data.mode === 'Online' ? 0 : 1;
      const priceValue = data.priceCents === 0 ? null : data.priceCents;
      
      const requestBody: any = {
        communityId: null,
        title: data.title,
        description: data.description || null,
        mode: modeValue,
        location: data.location || null,
        startsAt: data.startsAt,
        endsAt: data.endsAt || null,
        priceCents: priceValue,
        capacity: data.capacity || null,
      };

      const response = await authAxiosInstance.post(
        API_CONFIG.ENDPOINTS.EVENTS.BASE,
        requestBody
      );
      
      console.log('✅ Event created:', response.data);
      
      const eventId = response.data?.eventId || response.headers?.location?.split('/').pop();
      if (!eventId) {
        throw new Error('Không nhận được eventId từ server');
      }
      
      console.log('🔄 Auto-opening event:', eventId);
      try {
        await this.openEvent(eventId);
        console.log('✅ Event created and opened successfully');
      } catch (openError: any) {
        console.error('❌ Failed to auto-open event:', openError);
        throw new Error(`Event đã được tạo nhưng không thể mở tự động: ${openError.message || 'Lỗi không xác định'}`);
      }
      
      return eventId;
    } catch (error: any) {
      console.error('❌ Error creating event:', error);
      
      if (error.response?.status === 403) {
        const errorMsg = error.response?.data?.detail || error.response?.data?.message;
        throw new Error(errorMsg || 'Bạn cần có membership plan để tạo event');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.detail || error.response?.data?.message;
        throw new Error(errorMsg || 'Dữ liệu không hợp lệ');
      } else {
        throw new Error('Không thể tạo sự kiện');
      }
    }
  }

  static async updateEvent(eventId: string, data: {
    communityId?: string;
    title?: string;
    description?: string;
    mode?: 'Online' | 'Offline';
    location?: string;
    startsAt?: string;
    endsAt?: string;
    priceCents?: number;
    capacity?: number;
  }): Promise<void> {
    try {
      console.log('🔄 Updating event:', eventId, data);
      
      const requestBody: any = {};
      requestBody.communityId = null;
      if (data.title !== undefined) requestBody.title = data.title;
      if (data.description !== undefined) requestBody.description = data.description || null;
      if (data.mode !== undefined) {
        requestBody.mode = data.mode === 'Online' ? 0 : 1;
      }
      if (data.location !== undefined) requestBody.location = data.location || null;
      if (data.priceCents !== undefined) {
        requestBody.priceCents = data.priceCents === 0 ? null : data.priceCents;
      }
      if (data.startsAt !== undefined) requestBody.startsAt = data.startsAt;
      if (data.endsAt !== undefined) requestBody.endsAt = data.endsAt || null;
      if (data.priceCents !== undefined) requestBody.priceCents = data.priceCents;
      if (data.capacity !== undefined) requestBody.capacity = data.capacity || null;

      await authAxiosInstance.put(
        `${API_CONFIG.ENDPOINTS.EVENTS.BASE}/${eventId}`,
        requestBody
      );
      
      console.log('✅ Event updated');
    } catch (error: any) {
      console.error('❌ Error updating event:', error);
      
      if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền chỉnh sửa event này');
      } else if (error.response?.status === 404) {
        throw new Error('Không tìm thấy event');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.detail || error.response?.data?.message;
        throw new Error(errorMsg || 'Dữ liệu không hợp lệ');
      } else {
        throw new Error('Không thể cập nhật sự kiện');
      }
    }
  }

  static async openEvent(eventId: string): Promise<void> {
    try {
      console.log('🔄 Opening event:', eventId);
      
      await authAxiosInstance.post(
        API_CONFIG.ENDPOINTS.EVENTS.OPEN(eventId)
      );
      
      console.log('✅ Event opened');
    } catch (error: any) {
      console.error('❌ Error opening event:', error);
      
      if (error.response?.status === 403) {
        const errorMsg = error.response?.data?.detail || error.response?.data?.message;
        throw new Error(errorMsg || 'Không thể mở event. Kiểm tra escrow hoặc trạng thái event.');
      } else if (error.response?.status === 404) {
        throw new Error('Không tìm thấy event');
      } else if (error.response?.status === 409) {
        throw new Error('Event phải ở trạng thái Draft để mở');
      } else {
        throw new Error('Không thể mở sự kiện');
      }
    }
  }

  static async cancelEvent(eventId: string): Promise<void> {
    try {
      console.log('🔄 Canceling event:', eventId);
      
      await authAxiosInstance.post(
        API_CONFIG.ENDPOINTS.EVENTS.CANCEL(eventId)
      );
      
      console.log('✅ Event canceled');
    } catch (error: any) {
      console.error('❌ Error canceling event:', error);
      
      if (error.response?.status === 403) {
        throw new Error('Bạn không có quyền hủy event này');
      } else if (error.response?.status === 404) {
        throw new Error('Không tìm thấy event');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.detail || error.response?.data?.message;
        throw new Error(errorMsg || 'Không thể hủy event sau khi đã bắt đầu');
      } else {
        throw new Error('Không thể hủy sự kiện');
      }
    }
  }

  static async getMyEvents(filters?: EventFilters): Promise<EventListResponse> {
    try {
      console.log('🔄 Fetching my events...');
      
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      
      const response = await authAxiosInstance.get(
        `/api/organizer/events?${params.toString()}`
      );
      
      console.log('✅ My events fetched:', response.data);
      
      const apiData = response.data;
      const items = apiData.Items || apiData.items || [];
      
      const transformedItems = items.map((event: any) => this.transformEvent(event));
      
      return {
        items: transformedItems,
        totalCount: transformedItems.length,
        page: apiData.Page || 1,
        pageSize: apiData.PageSize || apiData.Size || 20,
        totalPages: apiData.TotalPages || 1,
        hasNext: apiData.HasNext || false,
        hasPrevious: apiData.HasPrevious || false
      };
    } catch (error: any) {
      console.error('❌ Error fetching my events:', error);
      throw new Error('Không thể tải danh sách sự kiện của bạn');
    }
  }

  static async getTodayEvents(): Promise<Event[]> {
    try {
      console.log('🔄 Fetching today events...');
      
      const today = new Date().toISOString().split('T')[0];
      const filters: EventFilters = {
        dateRange: {
          start: today,
          end: today
        }
      };
      
      const response = await this.getAllEvents(filters);
      return response.items;
    } catch (error: any) {
      console.error('❌ Error fetching today events:', error);
      return [];
    }
  }

  static async getUpcomingEvents(): Promise<Event[]> {
    try {
      console.log('🔄 Fetching upcoming events...');
      
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const filters: EventFilters = {
        dateRange: {
          start: today.toISOString().split('T')[0],
          end: nextWeek.toISOString().split('T')[0]
        }
      };
      
      const response = await this.getAllEvents(filters);
      return response.items;
    } catch (error: any) {
      console.error('❌ Error fetching upcoming events:', error);
      return [];
    }
  }

  private static transformEvent(event: any): Event {
    const backendStatus = event.Status || event.status || 'Open';
    let frontendStatus: 'Open' | 'Closed' | 'Completed' | 'Cancelled' | 'Draft' = 'Open';
    
    if (typeof backendStatus === 'string') {
      const statusLower = backendStatus.toLowerCase();
      if (statusLower === 'draft') frontendStatus = 'Draft';
      else if (statusLower === 'open') frontendStatus = 'Open';
      else if (statusLower === 'closed') frontendStatus = 'Closed';
      else if (statusLower === 'completed') frontendStatus = 'Completed';
      else if (statusLower === 'canceled' || statusLower === 'cancelled') frontendStatus = 'Cancelled';
    }

    const hasRegistration = !!(event.MyRegistrationId || event.myRegistrationId);
    
    return {
      id: event.Id || event.id || '',
      title: event.Title || event.title || 'Untitled Event',
      description: event.Description || event.description || '',
      eventType: event.EventType || event.eventType || 'Meetup',
      mode: event.Mode || event.mode || 'Online',
      startDate: event.StartsAt || event.startsAt || event.StartDate || event.startDate || '',
      endDate: event.EndsAt || event.endsAt || event.EndDate || event.endDate || '',
      maxParticipants: event.Capacity || event.capacity,
      currentParticipants: event.RegisteredCount || event.registeredCount || 0, // Số người đã đăng ký (RegisteredCount)
      registeredCount: event.RegisteredCount || event.registeredCount, // Tổng số đăng ký
      confirmedCount: event.ConfirmedCount || event.confirmedCount, // Số đã xác nhận
      isRegistered: hasRegistration || (event.MyRegistrationStatus && event.MyRegistrationStatus !== 'Canceled'),
      isOrganizer: event.IsOrganizer || event.isOrganizer || false,
      communityId: event.CommunityId || event.communityId,
      communityName: event.CommunityName || event.communityName,
      organizerId: event.OrganizerId || event.organizerId || '',
      organizerName: event.OrganizerName || event.organizerName || 'Unknown',
      status: frontendStatus,
      registrationDeadline: event.RegistrationDeadline || event.registrationDeadline,
      location: event.Location || event.location,
      requirements: event.Requirements || event.requirements || [],
      prizes: event.Prizes || event.prizes || [],
      rules: event.Rules || event.rules || [],
      createdAt: event.CreatedAtUtc || event.createdAtUtc || event.CreatedAt || event.createdAt || '',
      updatedAt: event.UpdatedAtUtc || event.updatedAtUtc || event.UpdatedAt || event.updatedAt || ''
    };
  }

  /**
   * Get event type icon
   */
  static getEventTypeIcon(eventType: string): string {
    if (!eventType || typeof eventType !== 'string') {
      return '📅';
    }
    
    switch (eventType.toLowerCase()) {
      case 'tournament':
        return '🏆';
      case 'meetup':
        return '👥';
      case 'workshop':
        return '🎓';
      case 'online':
        return '💻';
      case 'offline':
        return '🏢';
      default:
        return '📅';
    }
  }

  /**
   * Get event type color
   */
  static getEventTypeColor(eventType: string): string {
    if (!eventType || typeof eventType !== 'string') {
      return 'text-gray-500';
    }
    
    switch (eventType.toLowerCase()) {
      case 'tournament':
        return 'text-yellow-500';
      case 'meetup':
        return 'text-blue-500';
      case 'workshop':
        return 'text-green-500';
      case 'online':
        return 'text-purple-500';
      case 'offline':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  }

  /**
   * Get event status color
   */
  static getEventStatusColor(status: string): string {
    if (!status || typeof status !== 'string') {
      return 'text-gray-500';
    }
    
    switch (status.toLowerCase()) {
      case 'open':
        return 'text-green-500';
      case 'closed':
        return 'text-red-500';
      case 'completed':
        return 'text-gray-500';
      case 'cancelled':
      case 'canceled':
        return 'text-red-600';
      case 'draft':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  }

  /**
   * Format event date
   */
  static formatEventDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Check if event is happening today
   */
  static isEventToday(event: Event): boolean {
    const today = new Date().toISOString().split('T')[0];
    const eventDate = new Date(event.startDate).toISOString().split('T')[0];
    return eventDate === today;
  }

  /**
   * Check if event is upcoming (within 7 days)
   */
  static isEventUpcoming(event: Event): boolean {
    const today = new Date();
    const eventDate = new Date(event.startDate);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 7;
  }
}

export default EventService;
