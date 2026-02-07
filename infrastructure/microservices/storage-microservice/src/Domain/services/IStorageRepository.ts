import { AvailablePackagesDTO } from "../DTOs/AvailablePackagesDTO";
import { PackageSummaryDTO } from "../DTOs/PackageSummaryDTO";
import { WarehouseSummaryDTO } from "../DTOs/WarehouseSummaryDTO";

export interface IStorageRepository {
    getAvailablePackages(): Promise<AvailablePackagesDTO>;
    ensureAvailablePackages(quantity: number): Promise<number>;
    createPackagesFromPerfumes(perfumeIds: number[]): Promise<number>;
    sendPackages(quantity: number): Promise<number>;
    reservePackages(quantity: number): Promise<number[]>;
    markPackagesAsSent(packageIds: number[]): Promise<number>;
    unpackPackages(packageIds: number[]): Promise<number>;
    releasePackages(packageIds: number[]): Promise<number>;
    getWarehouses(): Promise<WarehouseSummaryDTO[]>;
    getPackages(): Promise<PackageSummaryDTO[]>;
}
