import { IStorageAPI } from "./IStorageAPI";
import { IHttpClient } from "../http/IHttpClient";
import { SendPackageDTO } from "../../models/storage/SendPackageDTO";
import { AvailablePackagesDTO } from "../../models/storage/AvailablePackagesDTO";

export class StorageAPI implements IStorageAPI {
    constructor(private readonly httpClient: IHttpClient) { }

    private readonly basePath = "/storage";

    private getAuthHeaders(token: string) {
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    private unwrapResponse<T>(data: unknown): T {
        if (data && typeof data === "object" && "data" in data) {
            return (data as { data: T }).data;
        }
        return data as T;
    }

    async sendPackage(
        data: SendPackageDTO,
        token: string
    ): Promise<{ sentPackages: number }> {
        const response = await this.httpClient.post<{ sentPackages: number }>(
            `${this.basePath}/send-package`,
            data,
            { headers: this.getAuthHeaders(token) }
        );

        return this.unwrapResponse<{ sentPackages: number }>(response);
    }

    async getAvailablePackages(token: string): Promise<AvailablePackagesDTO> {
        const response = await this.httpClient.get<AvailablePackagesDTO>(
            `${this.basePath}/available`,
            { headers: this.getAuthHeaders(token) }
        );

        return this.unwrapResponse<AvailablePackagesDTO>(response);
    }
}
