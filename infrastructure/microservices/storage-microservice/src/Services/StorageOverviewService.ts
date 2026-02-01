import { AvailablePackagesDTO } from "../Domain/DTOs/AvailablePackagesDTO";
import { PackageSummaryDTO } from "../Domain/DTOs/PackageSummaryDTO";
import { WarehouseSummaryDTO } from "../Domain/DTOs/WarehouseSummaryDTO";
import { IStorageOverviewService } from "../Domain/services/IStorageOverviewService";
import { IStorageRepository } from "../Domain/services/IStorageRepository";

export class StorageOverviewService implements IStorageOverviewService {
    constructor(private readonly storageRepo: IStorageRepository) { }

    async getAvailablePackages(): Promise<AvailablePackagesDTO> {
        return this.storageRepo.getAvailablePackages();
    }

    async getWarehouses(): Promise<WarehouseSummaryDTO[]> {
        return this.storageRepo.getWarehouses();
    }

    async getPackages(): Promise<PackageSummaryDTO[]> {
        return this.storageRepo.getPackages();
    }
}