import { PackagingSyncDTO, PackagingSyncResultDTO } from "../DTOs/PackagingSyncDTO";

export interface IStorageSyncService {
  syncPackagingPackages(data: PackagingSyncDTO): Promise<PackagingSyncResultDTO>;
}
