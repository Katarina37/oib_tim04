import axios, { AxiosInstance } from "axios";
import { CreateFiscalBillDTO } from "Domain/DTOs/CreateFiscallBillDTO";
import { IAnalysisClient } from "Domain/services/IAnalysisClient";

export class AnalysisClient implements IAnalysisClient {
    private readonly http: AxiosInstance;

    constructor(baseURL: string, gatewayKey: string) {
        this.http = axios.create({
            baseURL: baseURL,
            headers: {
                "Content-Type": "application/json",
                "X-Gateway-Key": gatewayKey
            },
            timeout: 5000
        });
    }

    async createFiscalBill(data: CreateFiscalBillDTO): Promise<{ billId: number; }> {
        const response = await this.http.post<{ billId: number }>(
            "/analysis/fiscal-bills",
            data
        );
        return { billId: response.data.billId };
    }
}
