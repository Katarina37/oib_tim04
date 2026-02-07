import { IStorageAPI } from "./IStorageAPI";
import { IHttpClient } from "../http/IHttpClient";
import { AvailablePackagesDTO } from "../../models/storage/AvailablePackagesDTO";
import { PackagePerfumesDTO } from "../../models/storage/PackagePerfumesDTO";
import { PackagePerfumesResultDTO } from "../../models/storage/PackagePerfumesResultDTO";
import { SendPackageDTO } from "../../models/storage/SendPackageDTO";
import { SendToWarehouseDTO } from "../../models/storage/SendToWarehouseDTO";
import { SendToWarehouseResultDTO } from "../../models/storage/SendToWarehouseResultDTO";
import { OverviewDTO } from "../../models/storage/OverviewDTO";

export class StorageAPI implements IStorageAPI {
    constructor(private readonly httpClient: IHttpClient) { }

    private readonly storageBasePath = "/storage";
    private readonly packagingBasePath = "/packaging";

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
            `${this.storageBasePath}/send-package`,
            data,
            { headers: this.getAuthHeaders(token) }
        );
        return this.unwrapResponse<{ sentPackages: number }>(response);
    }

    async getAvailablePackages(token: string): Promise<AvailablePackagesDTO> {
        const response = await this.httpClient.get<any>(
            `${this.storageBasePath}/available`,
            { headers: this.getAuthHeaders(token) }
        );
        return this.unwrapResponse<AvailablePackagesDTO>(response);
    }

    async getOverview(token: string): Promise<OverviewDTO> {
        const response = await this.httpClient.get<any>(
            `${this.storageBasePath}/overview`,
            { headers: this.getAuthHeaders(token) }
        );
        return this.unwrapResponse<OverviewDTO>(response);
    }

    async packagePerfumes(data: PackagePerfumesDTO, token: string): Promise<PackagePerfumesResultDTO> {
        const response = await this.httpClient.post<any>(
            `${this.packagingBasePath}/package-perfumes`,
            data,
            { headers: this.getAuthHeaders(token) }
        );

        return this.unwrapResponse<PackagePerfumesResultDTO>(response);
    }

    async sendToWarehouse(data: SendToWarehouseDTO, token: string): Promise<SendToWarehouseResultDTO> {
        const response = await this.httpClient.post<any>(
            `${this.packagingBasePath}/send-to-warehouse`,
            data,
            { headers: this.getAuthHeaders(token) }
        );

        return this.unwrapResponse<SendToWarehouseResultDTO>(response);
    }
}
