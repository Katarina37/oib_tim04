import { UserRecommendationDTO } from "../../models/recommendation/RecommendationDTO";

export interface IRecommendationAPI {
    getRecommendations(userId: number, token: string, limit?: number, refresh?: boolean): Promise<UserRecommendationDTO>;
    updateCoOccurrence(parfemId1: number, parfemId2: number, token: string): Promise<void>;
}