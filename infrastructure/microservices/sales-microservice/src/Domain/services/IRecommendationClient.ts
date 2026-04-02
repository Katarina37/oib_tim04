export interface IRecommendationClient {
    updateCoOccurrence(parfemId1: number, parfemId2: number): Promise<void>;
}