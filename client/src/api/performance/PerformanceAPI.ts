import { IPerformanceAPI } from "./IPerformanceAPI";
import { IHttpClient } from "../http/IHttpClient";
import { PerformanceReportDTO } from "../../models/performance/PerformanceReportDTO";
import { CreatePerformanceParams } from "../../models/performance/CreatePerformanceParams";

export class PerformanceAPI implements IPerformanceAPI {
    constructor(private readonly httpClient: IHttpClient) {}

    // Putanja do mikroservisa na Gateway-u
    private readonly basePath = "/api/v1/performance-analysis"; 
    private readonly baseURL = import.meta.env.VITE_GATEWAY_URL;
    private readonly gatewayKey = "OIBTIM4"; 

    private getAuthHeaders(token: string) {
        return {
            Authorization: `Bearer ${token}`,
            "X-Gateway-Key": this.gatewayKey,
        };
    }

    private unwrapResponse<T>(data: any): T {
        if (data && typeof data === "object" && data.success && "data" in data) {
            return data.data as T;
        }
        return data as T;
    }
     
    async runSimulation(data: CreatePerformanceParams, token: string): Promise<PerformanceReportDTO> {
        const response = await this.httpClient.post<any>(
            `${this.basePath}/simulacija/pokreni`,
            data,
            { headers: this.getAuthHeaders(token) }
        );
        return this.unwrapResponse<PerformanceReportDTO>(response);
    }

    async getReports(token: string): Promise<PerformanceReportDTO[]> {
        const response = await this.httpClient.get<any>(
            `${this.basePath}/izvestaji`, // Prema tvom kontroleru
            { headers: this.getAuthHeaders(token) }
        );
        return this.unwrapResponse<PerformanceReportDTO[]>(response);
    }

    async exportPerformancePDF(id: number, token: string): Promise<Blob> {
        const response = await fetch(`${this.baseURL}${this.basePath}/izvestaji/${id}/pdf`, {
            headers: {
                ...this.getAuthHeaders(token),
                Accept: "application/pdf"
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to export PDF: ${response.statusText}`);
        }
        return await response.blob();
    }
    
}

