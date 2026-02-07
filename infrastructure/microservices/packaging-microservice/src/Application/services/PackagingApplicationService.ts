import { AvailablePackagesDTO } from "../../Domain/DTOs/AvailablePackagesDTO";
import { EnsureAvailablePackagesResultDTO } from "../../Domain/DTOs/EnsureAvailablePackagesResultDTO";
import { OverviewDTO } from "../../Domain/DTOs/OverviewDTO";
import { PackagePerfumesDTO } from "../../Domain/DTOs/PackagePerfumesDTO";
import { PackagePerfumesResultDTO } from "../../Domain/DTOs/PackagePerfumesResultDTO";
import { SendToWarehouseDTO } from "../../Domain/DTOs/SendToWarehouseDTO";
import { SendToWarehouseResultDTO } from "../../Domain/DTOs/SendToWarehouseResultDTO";
import { EnsureAvailablePackagesUseCase } from "../usecases/EnsureAvailablePackagesUseCase";
import { GetAvailablePackagesUseCase } from "../usecases/GetAvailablePackagesUseCase";
import { GetPackagingOverviewUseCase } from "../usecases/GetPackagingOverviewUseCase";
import { PackagePerfumesUseCase } from "../usecases/PackagePerfumesUseCase";
import { SendToWarehouseUseCase } from "../usecases/SendToWarehouseUseCase";
import { IPackagingApplicationService } from "./IPackagingApplicationService";

export class PackagingApplicationService implements IPackagingApplicationService {
  constructor(
    private readonly packagePerfumesUseCase: PackagePerfumesUseCase,
    private readonly sendToWarehouseUseCase: SendToWarehouseUseCase,
    private readonly ensureAvailablePackagesUseCase: EnsureAvailablePackagesUseCase,
    private readonly getAvailablePackagesUseCase: GetAvailablePackagesUseCase,
    private readonly getPackagingOverviewUseCase: GetPackagingOverviewUseCase
  ) {}

  packagePerfumes(data: PackagePerfumesDTO): Promise<PackagePerfumesResultDTO> {
    return this.packagePerfumesUseCase.execute(data);
  }

  sendToWarehouse(data: SendToWarehouseDTO): Promise<SendToWarehouseResultDTO> {
    return this.sendToWarehouseUseCase.execute(data);
  }

  ensureAvailablePackages(quantity: number): Promise<EnsureAvailablePackagesResultDTO> {
    return this.ensureAvailablePackagesUseCase.execute(quantity);
  }

  getAvailablePackages(): Promise<AvailablePackagesDTO> {
    return this.getAvailablePackagesUseCase.execute();
  }

  getOverview(): Promise<OverviewDTO> {
    return this.getPackagingOverviewUseCase.execute();
  }
}
