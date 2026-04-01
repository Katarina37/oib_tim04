import { UserRecommendation } from "../models/UserRecommendation";

export interface IRecommendationRepository {
    findLatestByUserId(userId: number): Promise<UserRecommendation | null>;
    createRecommendation(data: Partial<UserRecommendation>): Promise<UserRecommendation>;
    updateCoOccurrence(parfemId1: number, parfemId2: number): Promise<void>;
    getCoOccurrenceForPerfume(parfemId: number, limit: number): Promise<Array<{ parfemId2: number; zajednickiBroj: number }>>;
    getTopSellingPerfumes(limit: number, daysBack: number): Promise<Array<{ id: number; naziv: string; ukupnoProdatih: number }>>;
    getUserPurchasedPerfumes(userId: number): Promise<Array<{ parfemId: number; naziv: string }>>;
}