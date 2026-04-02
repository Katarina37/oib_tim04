import { IHttpClient } from "../http/IHttpClient";
import { IRecommendationAPI } from "./IRecommendationAPI";
import { UserRecommendationDTO } from "../../models/recommendation/RecommendationDTO";

export class RecommendationAPI implements IRecommendationAPI {
    constructor(private readonly httpClient: IHttpClient) {}

    private readonly basePath = "/recommendations";

    private getAuthHeaders(token: string) {
        return { Authorization: `Bearer ${token}` };
    }

    private unwrapResponse<T>(data: unknown): T {
        if (data && typeof data === "object" && "data" in data) {
            return (data as { data: T }).data;
        }
        return data as T;
    }

    async getRecommendations(
        userId: number,
        token: string,
        limit?: number,
        refresh?: boolean
    ): Promise<UserRecommendationDTO> {
        const params: Record<string, string> = {};
        if (limit !== undefined) params.limit = String(limit);
        if (refresh !== undefined) params.refresh = String(refresh);

        const response = await this.httpClient.get<UserRecommendationDTO>(
            `${this.basePath}/${userId}`,
            {
                headers: this.getAuthHeaders(token),
                params,
            }
        );
        return this.unwrapResponse<UserRecommendationDTO>(response);
    }

    async updateCoOccurrence(
        parfemId1: number,
        parfemId2: number,
        token: string
    ): Promise<void> {
        await this.httpClient.post(
            `${this.basePath}/update-cooccurrence`,
            { parfemId1, parfemId2 },
            { headers: this.getAuthHeaders(token) }
        );
    }
}