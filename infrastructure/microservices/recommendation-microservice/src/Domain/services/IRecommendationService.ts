import { RecommendationResponseDTO } from "../DTOs/RecommendationResponse";
import { RecommendationRequestDTO } from "../DTOs/RecommendationRequestDTO";

export interface IRecommendationService {
    getRecommendationsForUser(request: RecommendationRequestDTO): Promise<RecommendationResponseDTO>;
    updateCollaborativeFilteringData(): Promise<void>;
    updateCoOccurrence(parfemId1: number, parfemId2: number): Promise<void>;
}