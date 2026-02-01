import { AvailablePackagesDTO } from "../../models/storage/AvailablePackagesDTO";
import { OverviewDTO } from "../../models/storage/OverviewDTO";
import { SendPackageDTO } from "../../models/storage/SendPackageDTO";
export interface IStorageAPI {
    sendPackage(data: SendPackageDTO, token: string): Promise<{ sentPackages: number }>;
    getAvailablePackages(token: string): Promise<AvailablePackagesDTO>;
    getOverview(token: string): Promise<OverviewDTO>;
}
