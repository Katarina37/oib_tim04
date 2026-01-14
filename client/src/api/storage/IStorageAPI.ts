import { AvailablePackagesDTO } from "../../models/storage/AvailablePackagesDTO";
import { SendPackageDTO } from "../../models/storage/SendPackageDTO";
export interface IStorageAPI {
    sendPackage(data: SendPackageDTO, token: string): Promise<{ sentPackages: number }>;
    getAvailablePackages(token: string): Promise<AvailablePackagesDTO>;
}
