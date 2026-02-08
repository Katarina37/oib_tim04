import { UserContext } from "../types/UserContext";
import { StorageInventoryDTO } from "../DTOs/StorageInventoryDTO";

export interface IStorageClient {
  reservePackages(quantity: number, userContext?: UserContext): Promise<number[]>;
  reservePackagesByPerfumeIds(
    perfumeIds: number[],
    userContext?: UserContext
  ): Promise<number[]>;
  sendReservedPackages(packageIds: number[], userContext?: UserContext): Promise<number>;
  unpackPackages(packageIds: number[], userContext?: UserContext): Promise<number>;
  releasePackages(packageIds: number[], userContext?: UserContext): Promise<number>;
  getInventory(userContext?: UserContext): Promise<StorageInventoryDTO>;
}
