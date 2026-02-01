import { WarehouseSummaryDTO, PackageSummaryDTO } from "./AvailablePackagesDTO";

export interface OverviewDTO {
    warehouses: WarehouseSummaryDTO[];
    packages: PackageSummaryDTO[];
}