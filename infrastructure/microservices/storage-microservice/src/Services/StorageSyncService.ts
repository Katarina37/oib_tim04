import { PackagingSyncDTO, PackagingSyncResultDTO } from "../Domain/DTOs/PackagingSyncDTO";
import { IStorageRepository } from "../Domain/services/IStorageRepository";
import { IStorageSyncService } from "../Domain/services/IStorageSyncService";

export class StorageSyncService implements IStorageSyncService {
  constructor(private readonly storageRepository: IStorageRepository) {}

  async syncPackagingPackages(data: PackagingSyncDTO): Promise<PackagingSyncResultDTO> {
    const result = await this.storageRepository.syncPackagedPackages(
      data.packageIds,
      data.targetWarehouseId
    );

    return {
      operation: data.operation,
      recordedPackages: result.recordedPackages,
      missingPackages: result.missingPackages,
    };
  }
}
