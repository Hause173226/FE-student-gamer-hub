import axiosInstance from './axiosInstance';
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
  isRegistered: boolean;
  communityId?: string;
  communityName?: string;
  organizerId: string;
  organizerName: string;
  status: 'Open' | 'Closed' | 'Completed' | 'Cancelled';
  registrationDeadline?: string;
  location?: string;
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
  /**
   * Lấy danh sách tất cả events
   */
  static async getAllEvents(filters?: EventFilters): Promise<EventListResponse> {
    try {
      console.log('🔄 Fetching all events...');
      
      const params = new URLSearchParams();
      if (filters?.eventType) params.append('eventType', filters.eventType);
      if (filters?.mode) params.append('mode', filters.mode);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      
      const response = await axiosInstance.get(
        `${API_CONFIG.ENDPOINTS.EVENTS.BASE}?${params.toString()}`
      );
      
      console.log('✅ Events fetched:', response.data);
      
      // Transform API response to our format
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

  /**
   * Lấy event theo ID
   */
  static async getEventById(eventId: string): Promise<Event> {
    try {
      console.log('🔄 Fetching event by ID:', eventId);
      
      const response = await axiosInstance.get(
        `${API_CONFIG.ENDPOINTS.EVENTS.BASE}/${eventId}`
      );
      
      console.log('✅ Event fetched:', response.data);
      return this.transformEvent(response.data);
    } catch (error: any) {
      console.error('❌ Error fetching event:', error);
      throw new Error('Không thể tải thông tin sự kiện');
    }
  }

  /**
   * Đăng ký tham gia event
   */
  static async registerEvent(eventId: string): Promise<EventRegistration> {
    try {
      console.log('🔄 Registering for event:', eventId);
      
      const response = await axiosInstance.post(
        API_CONFIG.ENDPOINTS.EVENTS.REGISTER(eventId)
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
      
      if (error.response?.status === 409) {
        throw new Error('Bạn đã đăng ký sự kiện này rồi');
      } else if (error.response?.status === 400) {
        throw new Error('Sự kiện đã đóng đăng ký hoặc đã đầy');
      } else {
        throw new Error('Không thể đăng ký sự kiện');
      }
    }
  }

  /**
   * Hủy đăng ký event
   */
  static async unregisterEvent(eventId: string): Promise<void> {
    try {
      console.log('🔄 Unregistering from event:', eventId);
      
      await axiosInstance.delete(
        `${API_CONFIG.ENDPOINTS.EVENTS.BASE}/${eventId}/unregister`
      );
      
      console.log('✅ Event unregistration successful');
    } catch (error: any) {
      console.error('❌ Error unregistering from event:', error);
      throw new Error('Không thể hủy đăng ký sự kiện');
    }
  }

  /**
   * Lấy events hôm nay (cho Dashboard)
   */
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

  /**
   * Lấy events sắp tới (7 ngày tới)
   */
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

  /**
   * Transform API response to our Event interface
   */
  private static transformEvent(event: any): Event {
    return {
      id: event.Id || event.id || '',
      title: event.Title || event.title || 'Untitled Event',
      description: event.Description || event.description || '',
      eventType: event.EventType || event.eventType || 'Meetup',
      mode: event.Mode || event.mode || 'Online',
      startDate: event.StartDate || event.startDate || '',
      endDate: event.EndDate || event.endDate || '',
      maxParticipants: event.MaxParticipants || event.maxParticipants,
      currentParticipants: event.CurrentParticipants || event.currentParticipants || 0,
      isRegistered: event.IsRegistered || event.isRegistered || false,
      communityId: event.CommunityId || event.communityId,
      communityName: event.CommunityName || event.communityName,
      organizerId: event.OrganizerId || event.organizerId || '',
      organizerName: event.OrganizerName || event.organizerName || 'Unknown',
      status: event.Status || event.status || 'Open',
      registrationDeadline: event.RegistrationDeadline || event.registrationDeadline,
      location: event.Location || event.location,
      requirements: event.Requirements || event.requirements || [],
      prizes: event.Prizes || event.prizes || [],
      rules: event.Rules || event.rules || [],
      createdAt: event.CreatedAt || event.createdAt || '',
      updatedAt: event.UpdatedAt || event.updatedAt || ''
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
        return 'text-red-600';
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
