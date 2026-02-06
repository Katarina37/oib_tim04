// src/api/sales/SalesAPI.ts
import { ISaleAPI } from "./ISaleAPI";
import { IHttpClient } from "../http/IHttpClient";
import { CreateSaleDTO } from "../../models/sales/CreateSaleDTO";
import { SaleResponseDTO } from "../../models/sales/SaleResponseDTO";
import { PerfumeDTO } from "../../models/sales/PerfumeDTO";

export class SalesAPI implements ISaleAPI {
    private readonly basePath = "/sales";
    private readonly gatewayKey =
        import.meta.env.VITE_GATEWAY_API_KEY ?? import.meta.env.VITE_GATEWAY_KEY;

    constructor(private readonly httpClient: IHttpClient) {}

    private getHeaders(token: string) {
        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`,
        };

        if (this.gatewayKey) {
            headers["X-Gateway-Key"] = this.gatewayKey;
        }

        return { headers };
    }

    // Pomoćna funkcija za čišćenje podataka ako bek vraća { data: ... }
    private unwrapResponse<T>(data: unknown): T {
        if (data && typeof data === "object" && "data" in data) {
            return (data as { data: T }).data;
        }
        return data as T;
    }

    async executeSale(data: CreateSaleDTO, token: string): Promise<SaleResponseDTO> {
        const response = await this.httpClient.post<SaleResponseDTO>(
            `${this.basePath}/`,
            data,
            this.getHeaders(token)
        );
        return this.unwrapResponse<SaleResponseDTO>(response);
    }

    async getAllSales(token: string): Promise<SaleResponseDTO[]> {
        const response = await this.httpClient.get<SaleResponseDTO[]>(
            `${this.basePath}/`,
            this.getHeaders(token)
        );
        return this.unwrapResponse<SaleResponseDTO[]>(response);
    }

    async getSaleById(id: number, token: string): Promise<SaleResponseDTO> {
        const response = await this.httpClient.get<SaleResponseDTO>(
            `${this.basePath}/${id}`,
            this.getHeaders(token)
        );
        return this.unwrapResponse<SaleResponseDTO>(response);
    }

    async getSaleByBillNumber(billNumber: string, token: string): Promise<SaleResponseDTO> {
        const response = await this.httpClient.get<SaleResponseDTO>(
            `${this.basePath}/bill/${billNumber}`,
            this.getHeaders(token)
        );
        return this.unwrapResponse<SaleResponseDTO>(response);
    }

    async deleteSale(id: number, token: string): Promise<void> {
        await this.httpClient.delete(
            `${this.basePath}/${id}`,
            this.getHeaders(token)
        );
    }

    async getAvailablePerfumes(token: string): Promise<PerfumeDTO[]> {
        const response = await this.httpClient.get<PerfumeDTO[]>(
            `${this.basePath}/perfumes/available`,
            this.getHeaders(token)
        );
        return this.unwrapResponse<PerfumeDTO[]>(response);
    }
}
