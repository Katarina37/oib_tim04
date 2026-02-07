import { AvailablePackagesDTO } from "../../Domain/DTOs/AvailablePackagesDTO";
import { EnsureAvailablePackagesResultDTO } from "../../Domain/DTOs/EnsureAvailablePackagesResultDTO";
import { OverviewDTO } from "../../Domain/DTOs/OverviewDTO";
import { PackagePerfumesDTO } from "../../Domain/DTOs/PackagePerfumesDTO";
import { PackagePerfumesResultDTO } from "../../Domain/DTOs/PackagePerfumesResultDTO";
import { SendToWarehouseDTO } from "../../Domain/DTOs/SendToWarehouseDTO";
import { SendToWarehouseResultDTO } from "../../Domain/DTOs/SendToWarehouseResultDTO";

export interface IPackagingApplicationService {
  packagePerfumes(data: PackagePerfumesDTO): Promise<PackagePerfumesResultDTO>;
  sendToWarehouse(data: SendToWarehouseDTO): Promise<SendToWarehouseResultDTO>;
  ensureAvailablePackages(quantity: number): Promise<EnsureAvailablePackagesResultDTO>;
  getAvailablePackages(): Promise<AvailablePackagesDTO>;
  getOverview(): Promise<OverviewDTO>;
}
