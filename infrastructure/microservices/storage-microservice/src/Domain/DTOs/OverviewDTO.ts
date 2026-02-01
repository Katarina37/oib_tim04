import { PackageSummaryDTO } from "./PackageSummaryDTO";
import { WarehouseSummaryDTO } from "./WarehouseSummaryDTO";

export interface OverviewDTO {
    warehouses: WarehouseSummaryDTO[];
    packages: PackageSummaryDTO[];
}