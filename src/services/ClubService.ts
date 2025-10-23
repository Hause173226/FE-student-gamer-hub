import axiosInstance from "./axiosInstance";
import {ClubListResponse, ClubSummary, CreateClubPayload} from "../types";

const ClubService = {

    getClubsByCommunityId(communityId: string): Promise<ClubListResponse> {
        const API_ENDPOINT = `/communities/${communityId}/clubs`;

        return axiosInstance
            .get<ClubListResponse>(API_ENDPOINT)
            .then(response => response.data);
    },
    async createClub(payload: CreateClubPayload): Promise<ClubSummary> {
        const API_ENDPOINT = `clubs`;
        const response = await axiosInstance.post<ClubSummary>(API_ENDPOINT, payload);
        return response.data;
    },
    joinClub(clubId: string): Promise<ClubSummary> {
        const API_ENDPOINT = `/clubs/${clubId}/join`;
        return axiosInstance.post(API_ENDPOINT).then((res) => res.data);
    },

};

export default ClubService;