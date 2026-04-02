import { AxiosInstance } from "axios";
import { IRecommendationClient } from "../../Domain/services/IRecommendationClient";

export class AxiosRecommendationClient implements IRecommendationClient {
    constructor(private readonly httpClient: AxiosInstance) {}

    async updateCoOccurrence(parfemId1: number, parfemId2: number): Promise<void> {
        await this.httpClient.post("/recommendations/update-cooccurrence", {
            parfemId1,
            parfemId2,
        });
    }
}