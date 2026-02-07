import { IStorageAPI } from "./IStorageAPI";
import { IHttpClient } from "../http/IHttpClient";
import { AvailablePackagesDTO } from "../../models/storage/AvailablePackagesDTO";
import { SendPackageDTO } from "../../models/storage/SendPackageDTO";
import { OverviewDTO } from "../../models/storage/OverviewDTO";

export class StorageAPI implements IStorageAPI {
    constructor(private readonly httpClient: IHttpClient) { }

    private readonly basePath = "/storage";
    private readonly baseURL = import.meta.env.VITE_GATEWAY_URL;

    private getAuthHeaders(token: string) {
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    private unwrapResponse<T>(data: any): T {
        if (data && typeof data === "object" && data.success && "data" in data) {
            return data.data as T;
        }
        return data as T;
    }

    async sendPackage(data: SendPackageDTO, token: string): Promise<{ sentPackages: number }> {
        const response = await this.httpClient.post<any>(
            `${this.baseURL}${this.basePath}/send-package`,
            data,
            { headers: this.getAuthHeaders(token) }
        );
        return this.unwrapResponse<{ sentPackages: number }>(response);
    }

    async getAvailablePackages(token: string): Promise<AvailablePackagesDTO> {
        const response = await this.httpClient.get<any>(
            `${this.baseURL}${this.basePath}/available`,
            { headers: this.getAuthHeaders(token) }
        );
        return this.unwrapResponse<AvailablePackagesDTO>(response);
    }

    async getOverview(token: string): Promise<OverviewDTO> {
        const response = await this.httpClient.get<any>(
            `${this.basePath}/overview`,
            { headers: this.getAuthHeaders(token) }
        );
        return this.unwrapResponse<OverviewDTO>(response);
    }
}
