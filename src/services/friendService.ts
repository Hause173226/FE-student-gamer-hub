import axiosInstance from "./axiosInstance";

// ============================================
// TYPES & INTERFACES
// ============================================

export interface FriendDto {
  userId: string;
  userName: string;
  fullName: string;
  avatarUrl?: string;
  status: FriendStatus;
  createdAt: string;
}

interface BackendFriendItem {
  Id: string;
  User: {
    Id: string;
    UserName: string;
    FullName?: string;
    AvatarUrl?: string;
  };
  Status: string;
  BecameFriendsAtUtc: string;
}

interface BackendFriendsResponse {
  Items: BackendFriendItem[];
  NextCursor?: string;
  PrevCursor?: string;
  Size: number;
  Sort: string;
  Desc: boolean;
}

export interface FriendRequestDto {
  UserId: string;
  UserName: string;
  FullName: string;
  AvatarUrl: string | null;
  University: string | null;
  Status: "Pending" | "Accepted" | "Declined";
  RequestedAtUtc: string;
}

export enum FriendStatus {
  Pending = "Pending",
  Accepted = "Accepted",
  Declined = "Declined",
}

export interface CursorRequest {
  cursor?: string;
  pageSize?: number;
}

export interface CursorPageResult<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
  totalCount?: number;
}

export interface GetFriendsParams extends CursorRequest {
  filter?: string;
}

export interface UserSearchResult {
  UserId: string;
  UserName: string;
  FullName: string;
  AvatarUrl: string | null;
  University: string;
  IsFriend: boolean;
  IsPending: boolean;
}

export interface PagedResult<T> {
  Items: T[];
  Page: number;
  PageSize: number;
  TotalCount: number;
  TotalPages: number;
  HasPrevious: boolean;
  HasNext: boolean;
  Sort: string;
  Desc: boolean;
}

export interface SearchUsersParams {
  q: string;
  Page?: number;
  Size?: number;
  Sort?: string;
  Desc?: boolean;
}

export interface GetIncomingRequestsParams {
  Page?: number;
  Size?: number;
  Sort?: string;
  Desc?: boolean;
}

// ============================================
// FRIEND SERVICE
// ============================================

const friendService = {
  inviteFriend(userId: string): Promise<void> {
    return axiosInstance
      .post(`/api/Friends/${userId}/invite`)
      .then(() => undefined);
  },

  acceptFriend(userId: string): Promise<void> {
    return axiosInstance
      .post(`/api/Friends/${userId}/accept`)
      .then(() => undefined);
  },

  declineFriend(userId: string): Promise<void> {
    return axiosInstance
      .post(`/api/Friends/${userId}/decline`)
      .then(() => undefined);
  },

  cancelFriendInvite(userId: string): Promise<void> {
    return axiosInstance
      .post(`/api/Friends/${userId}/cancel`)
      .then(() => undefined);
  },

  // ✅ SIMPLIFIED: Lấy tất cả friends, không filter
  getFriends(params?: GetFriendsParams): Promise<CursorPageResult<FriendDto>> {
    return axiosInstance
      .get<BackendFriendsResponse>("/api/Friends", {
        params: {
          Cursor: params?.cursor,
          Size: params?.pageSize || 20,
        },
      })
      .then((res) => {
        const mappedItems: FriendDto[] = (res.data.Items || []).map((item) => ({
          userId: item.User.Id,
          userName: item.User.UserName,
          fullName: item.User.FullName || item.User.UserName,
          avatarUrl: item.User.AvatarUrl,
          status: item.Status as FriendStatus,
          createdAt: item.BecameFriendsAtUtc,
        }));

        return {
          items: mappedItems,
          nextCursor: res.data.NextCursor || undefined,
          hasMore: !!res.data.NextCursor,
          totalCount: mappedItems.length,
        };
      });
  },

  // ✅ SIMPLIFIED: Lấy tất cả, không filter
  getAllFriends(cursor?: string, pageSize?: number) {
    return this.getFriends({ cursor, pageSize });
  },

  // ✅ SIMPLIFIED: Lấy tất cả, không filter
  getPendingRequests(cursor?: string, pageSize?: number) {
    return this.getFriends({ cursor, pageSize });
  },

  // ✅ SIMPLIFIED: Lấy tất cả, không filter
  getAcceptedFriends(cursor?: string, pageSize?: number) {
    return this.getFriends({ cursor, pageSize });
  },

  getIncomingRequests(
    params?: GetIncomingRequestsParams
  ): Promise<PagedResult<FriendRequestDto>> {
    return axiosInstance
      .get<PagedResult<FriendRequestDto>>("/api/Friends/requests/incoming", {
        params: {
          Page: params?.Page || 1,
          Size: params?.Size || 20,
          Sort: params?.Sort || "CreatedAtUtc",
          Desc: params?.Desc || false,
        },
      })
      .then((res) => res.data);
  },

  searchUsers(
    params: SearchUsersParams
  ): Promise<PagedResult<UserSearchResult>> {
    return axiosInstance
      .get<PagedResult<UserSearchResult>>("/api/Friends/search", {
        params: {
          q: params.q,
          Page: params.Page || 1,
          Size: params.Size || 20,
          Sort: params.Sort || "FullName",
          Desc: params.Desc || false,
        },
      })
      .then((res) => res.data);
  },
};

export default friendService;
