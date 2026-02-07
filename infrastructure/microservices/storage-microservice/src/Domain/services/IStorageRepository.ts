import { AvailablePackagesDTO } from "../DTOs/AvailablePackagesDTO";
import { PackageSummaryDTO } from "../DTOs/PackageSummaryDTO";
import { WarehouseSummaryDTO } from "../DTOs/WarehouseSummaryDTO";

export interface IStorageRepository {
    getAvailablePackages(): Promise<AvailablePackagesDTO>;
    sendPackages(quantity: number): Promise<number>;
    reservePackages(quantity: number): Promise<number[]>;
    markPackagesAsSent(packageIds: number[]): Promise<number>;
    unpackPackages(packageIds: number[]): Promise<number>;
    releasePackages(packageIds: number[]): Promise<number>;
    syncPackagedPackages(
        packageIds: number[],
        targetWarehouseId?: number
    ): Promise<{ recordedPackages: number; missingPackages: number }>;
    getWarehouses(): Promise<WarehouseSummaryDTO[]>;
    getPackages(): Promise<PackageSummaryDTO[]>;
}
