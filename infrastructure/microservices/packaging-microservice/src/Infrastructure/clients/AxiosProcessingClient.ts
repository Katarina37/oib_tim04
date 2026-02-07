import axios, { AxiosInstance } from "axios";
import {
    ProcessingClientPort,
    RequestPerfumesCriteria,
    ProcessingPerfumeDTO,
} from "../../Application/ports/ProcessingClientPort";

type ProcessingBatchPayload = {
    success?: boolean;
    data?: {
        perfumes?: ProcessingPerfumeDTO[];
    };
};

export class AxiosProcessingClient implements ProcessingClientPort {
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

    async requestPerfumesForPackaging(
        criteria: number | RequestPerfumesCriteria
    ): Promise<ProcessingPerfumeDTO[]> {
        const payload: RequestPerfumesCriteria =
            typeof criteria === "number" ? { quantity: criteria } : criteria;

        const response = await this.http.post<ProcessingBatchPayload>(
            "/processing/request-perfumes",
            payload
        );

        const perfumes = response.data?.data?.perfumes;
        if (!Array.isArray(perfumes)) {
            throw new Error("Prerada nije vratila validnu listu parfema za pakovanje.");
        }

        return perfumes;
    }
}
