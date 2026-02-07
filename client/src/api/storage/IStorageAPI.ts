import { AvailablePackagesDTO } from "../../models/storage/AvailablePackagesDTO";
import { OverviewDTO } from "../../models/storage/OverviewDTO";
import { PackagePerfumesDTO } from "../../models/storage/PackagePerfumesDTO";
import { PackagePerfumesResultDTO } from "../../models/storage/PackagePerfumesResultDTO";
import { SendPackageDTO } from "../../models/storage/SendPackageDTO";
import { SendToWarehouseDTO } from "../../models/storage/SendToWarehouseDTO";
import { SendToWarehouseResultDTO } from "../../models/storage/SendToWarehouseResultDTO";

export interface IStorageAPI {
    sendPackage(data: SendPackageDTO, token: string): Promise<{ sentPackages: number }>;
    getAvailablePackages(token: string): Promise<AvailablePackagesDTO>;
    getOverview(token: string): Promise<OverviewDTO>;
    packagePerfumes(data: PackagePerfumesDTO, token: string): Promise<PackagePerfumesResultDTO>;
    sendToWarehouse(data: SendToWarehouseDTO, token: string): Promise<SendToWarehouseResultDTO>;
}
