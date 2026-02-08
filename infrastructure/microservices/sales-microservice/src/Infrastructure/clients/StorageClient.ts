import axios, { AxiosInstance } from "axios";
import { IStorageClient } from "../../Domain/services/IStorageClient";
import { UserContext } from "../../Domain/types/UserContext";
import { StorageInventoryDTO } from "../../Domain/DTOs/StorageInventoryDTO";

export class StorageClient implements IStorageClient {
    private readonly http: AxiosInstance;

    constructor(baseURL: string, gatewayKey: string) {
        this.http = axios.create({
            baseURL,
            headers: {
                "Content-Type": "application/json",
                "X-Gateway-Key": gatewayKey
            }, 
            timeout: 5000
        });
    }

    private buildUserHeaders(userContext?: UserContext): Record<string, string> {
        if (!userContext) {
            return {};
        }

        return {
            "X-User-Id": String(userContext.id),
            "X-User-Role": userContext.role,
        };
    }

    private async postQuantityAction(
        path: string,
        quantity: number,
        userContext?: UserContext
    ): Promise<any> {
        const response = await this.http.post(
            path,
            { quantity },
            { headers: this.buildUserHeaders(userContext) }
        );

        return response.data;
    }

    private async postPackageIdsAction(
        path: string,
        packageIds: number[],
        userContext?: UserContext
    ): Promise<any> {
        const response = await this.http.post(
            path,
            { packageIds },
            { headers: this.buildUserHeaders(userContext) }
        );

        return response.data;
    }

    private async postPerfumeIdsAction(
        path: string,
        perfumeIds: number[],
        userContext?: UserContext
    ): Promise<any> {
        const response = await this.http.post(
            path,
            { perfumeIds },
            { headers: this.buildUserHeaders(userContext) }
        );

        return response.data;
    }

    async reservePackages(quantity: number, userContext?: UserContext): Promise<number[]> {
        const data = await this.postQuantityAction(
            "/storage/reserve-package",
            quantity,
            userContext
        );

        const packageIds = data?.data?.packageIds ?? data?.packageIds;
        if (!Array.isArray(packageIds)) {
            throw new Error("Invalid reserve response from storage service");
        }

        if (packageIds.some((id) => !Number.isInteger(id) || id <= 0)) {
            throw new Error("Invalid package IDs from storage service");
        }

        return packageIds;
    }

    async reservePackagesByPerfumeIds(
        perfumeIds: number[],
        userContext?: UserContext
    ): Promise<number[]> {
        const data = await this.postPerfumeIdsAction(
            "/storage/reserve-package-by-perfumes",
            perfumeIds,
            userContext
        );

        const packageIds = data?.data?.packageIds ?? data?.packageIds;
        if (!Array.isArray(packageIds)) {
            throw new Error("Invalid reserve-by-perfumes response from storage service");
        }

        if (packageIds.some((id) => !Number.isInteger(id) || id <= 0)) {
            throw new Error("Invalid package IDs from storage service");
        }

        return packageIds;
    }

    async sendReservedPackages(packageIds: number[], userContext?: UserContext): Promise<number> {
        const data = await this.postPackageIdsAction(
            "/storage/send-reserved",
            packageIds,
            userContext
        );

        const sentPackages =
            data?.data?.sentPackages ??
            data?.sentPackages;

        if (typeof sentPackages !== "number") {
            throw new Error("Invalid send response from storage service");
        }

        return sentPackages;
    }

    async unpackPackages(packageIds: number[], userContext?: UserContext): Promise<number> {
        const data = await this.postPackageIdsAction(
            "/storage/unpack-package",
            packageIds,
            userContext
        );

        const unpackedPackages =
            data?.data?.unpackedPackages ??
            data?.unpackedPackages;

        if (typeof unpackedPackages !== "number") {
            throw new Error("Invalid unpack response from storage service");
        }

        return unpackedPackages;
    }

    async releasePackages(packageIds: number[], userContext?: UserContext): Promise<number> {
        const data = await this.postPackageIdsAction(
            "/storage/release-package",
            packageIds,
            userContext
        );

        const releasedPackages =
            data?.data?.releasedPackages ??
            data?.releasedPackages;

        if (typeof releasedPackages !== "number") {
            throw new Error("Invalid release response from storage service");
        }

        return releasedPackages;
    }

    async getInventory(userContext?: UserContext): Promise<StorageInventoryDTO> {
        const response = await this.http.get("/storage/available", {
            headers: this.buildUserHeaders(userContext),
        });

        const distributiveCenter = Number(response.data?.distributiveCenter);
        const warehouseCenter = Number(response.data?.warehouseCenter);

        if (!Number.isFinite(distributiveCenter) || !Number.isFinite(warehouseCenter)) {
            throw new Error("Invalid inventory response from storage service");
        }

        return { distributiveCenter, warehouseCenter };
    }
}
