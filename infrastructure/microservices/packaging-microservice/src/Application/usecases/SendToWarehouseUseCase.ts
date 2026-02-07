import { SendToWarehouseDTO } from "../../Domain/DTOs/SendToWarehouseDTO";
import { SendToWarehouseResultDTO } from "../../Domain/DTOs/SendToWarehouseResultDTO";
import { LogLevel } from "../../Domain/enums/LogLevel";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { EnsureAvailablePackagesResultDTO } from "../../Domain/DTOs/EnsureAvailablePackagesResultDTO";
import { PackagingRepositoryPort } from "../ports/PackagingRepositoryPort";
import { StorageClientPort } from "../ports/StorageClientPort";

export interface EnsureAvailablePackagesExecutor {
  execute(quantity: number): Promise<EnsureAvailablePackagesResultDTO>;
}

export class SendToWarehouseUseCase {
  constructor(
    private readonly repository: PackagingRepositoryPort,
    private readonly storageClient: StorageClientPort,
    private readonly logger: ILoggerService,
    private readonly ensureAvailablePackagesUseCase: EnsureAvailablePackagesExecutor
  ) {}

  async execute(data: SendToWarehouseDTO): Promise<SendToWarehouseResultDTO> {
    const requestedPackageIds = Array.isArray(data.packageIds) ? data.packageIds : [];
    const requestedPackages = requestedPackageIds.length > 0 ? requestedPackageIds.length : 1;

    let movedPackageIds = await this.repository.sendPackagesToWarehouse(
      data.targetWarehouseId,
      requestedPackageIds
    );

    const shouldTryAutoPackaging = requestedPackageIds.length === 0 && movedPackageIds.length === 0;
    if (shouldTryAutoPackaging) {
      await this.ensureAvailablePackagesUseCase.execute(requestedPackages);
      movedPackageIds = await this.repository.sendPackagesToWarehouse(data.targetWarehouseId, []);
    }

    if (movedPackageIds.length > 0) {
      await this.storageClient.syncMovedPackages({
        packageIds: movedPackageIds,
        targetWarehouseId: data.targetWarehouseId,
      });
    }

    const movedPackages = movedPackageIds.length;
    const missingPackages = Math.max(0, requestedPackages - movedPackages);
    const level = missingPackages === 0 ? LogLevel.INFO : LogLevel.WARNING;

    await this.logger.log(
      `Slanje u skladiste zavrseno: ${movedPackages}/${requestedPackages}`,
      level,
      {
        additionalData: {
          targetWarehouseId: data.targetWarehouseId,
          requestMode: requestedPackageIds.length > 0 ? "manual" : "first-available",
          autoPackagingTriggered: shouldTryAutoPackaging,
          requestedPackages,
          movedPackages,
          missingPackages,
          movedPackageIds,
        },
      }
    );

    return {
      requestedPackages,
      movedPackages,
      missingPackages,
      movedPackageIds,
      targetWarehouseId: data.targetWarehouseId,
    };
  }
}
