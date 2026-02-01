import { WarehouseSummaryDTO } from "../DTOs/WarehouseSummaryDTO";
import { PackageSummaryDTO } from "../DTOs/PackageSummaryDTO";
import { AvailablePackagesDTO } from "../DTOs/AvailablePackagesDTO";

export interface IStorageOverviewService {
    getAvailablePackages(): Promise<AvailablePackagesDTO>;
    getWarehouses(): Promise<WarehouseSummaryDTO[]>;
    getPackages(): Promise<PackageSummaryDTO[]>;
}