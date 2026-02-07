import axios, { AxiosInstance } from "axios";
import {
    IProcessingClient,
    ProcessingPerfumeDTO,
} from "../../Domain/services/IProcessingClient";

type ProcessingBatchPayload = {
    success?: boolean;
    data?: {
        perfumes?: ProcessingPerfumeDTO[];
    };
};

export class AxiosProcessingClient implements IProcessingClient {
    private readonly http: AxiosInstance;

    constructor(baseURL: string, gatewayKey: string) {
        this.http = axios.create({
            baseURL,
            headers: {
                "Content-Type": "application/json",
                "X-Gateway-Key": gatewayKey,
            },
            timeout: 5000,
        });
    }

    async requestPerfumesForPackaging(quantity: number): Promise<ProcessingPerfumeDTO[]> {
        const response = await this.http.post<ProcessingBatchPayload>(
            "/processing/request-perfumes",
            { quantity }
        );

        const perfumes = response.data?.data?.perfumes;
        if (!Array.isArray(perfumes)) {
            throw new Error("Prerada nije vratila validnu listu parfema za pakovanje.");
        }

        return perfumes;
    }
}
