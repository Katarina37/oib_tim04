import { PackageSummaryDTO } from "../../Domain/DTOs/PackageSummaryDTO";
import { WarehouseSummaryDTO } from "../../Domain/DTOs/WarehouseSummaryDTO";

export interface CreatePackagesOptions {
  packageName: string;
  senderAddress: string;
  targetWarehouseId?: number;
}

export interface PackagingRepositoryPort {
  countAvailablePackages(): Promise<number>;
  createPackagesFromPerfumes(perfumeIds: number[], options: CreatePackagesOptions): Promise<number[]>;
  sendPackagesToWarehouse(packageIds: number[], targetWarehouseId: number): Promise<number[]>;
  getWarehouses(): Promise<WarehouseSummaryDTO[]>;
  getPackages(): Promise<PackageSummaryDTO[]>;
}
