import axiosInstance from "./axiosInstance";
import {Community, CommunityListResponse, CreateCommunityPayload} from "../types";

// (Thêm type cho các tham số để code an toàn hơn)
export interface CommunityFilterParams {
    search?: string;
    // Sau này có thể thêm các filter khác
    // university?: string;
    // minMembers?: number;
}
const communityService = {
    createCommunity(formData: CreateCommunityPayload): Promise<Community> {
        // URL API của bạn, ví dụ: '/communities'
        const API_ENDPOINT = '/communities';

        return axiosInstance
            .post<Community>(API_ENDPOINT, formData)
            .then(response => response.data);
    },
    getAllCommunities(params?: CommunityFilterParams): Promise<CommunityListResponse> {
        const API_ENDPOINT = '/communities';

        // Gửi các tham số lên URL nếu có
        return axiosInstance
            .get<CommunityListResponse>(API_ENDPOINT, { params })
            .then(response => response.data);
    },
};

export default communityService;