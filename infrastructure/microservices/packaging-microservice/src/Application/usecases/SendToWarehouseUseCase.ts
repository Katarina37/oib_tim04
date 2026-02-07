import { SendToWarehouseDTO } from "../../Domain/DTOs/SendToWarehouseDTO";
import { SendToWarehouseResultDTO } from "../../Domain/DTOs/SendToWarehouseResultDTO";
import { LogLevel } from "../../Domain/enums/LogLevel";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { PackagingRepositoryPort } from "../ports/PackagingRepositoryPort";
import { StorageClientPort } from "../ports/StorageClientPort";

export class SendToWarehouseUseCase {
  constructor(
    private readonly repository: PackagingRepositoryPort,
    private readonly storageClient: StorageClientPort,
    private readonly logger: ILoggerService
  ) {}

  async execute(data: SendToWarehouseDTO): Promise<SendToWarehouseResultDTO> {
    const requestedPackageIds = Array.isArray(data.packageIds) ? data.packageIds : [];
    const movedPackageIds = await this.repository.sendPackagesToWarehouse(
      data.targetWarehouseId,
      requestedPackageIds
    );

    if (movedPackageIds.length > 0) {
      await this.storageClient.syncMovedPackages({
        packageIds: movedPackageIds,
        targetWarehouseId: data.targetWarehouseId,
      });
    }

    const movedPackages = movedPackageIds.length;
    const requestedPackages = requestedPackageIds.length > 0 ? requestedPackageIds.length : 1;
    const missingPackages = Math.max(0, requestedPackages - movedPackages);
    const level = missingPackages === 0 ? LogLevel.INFO : LogLevel.WARNING;

    await this.logger.log(
      `Slanje u skladiste zavrseno: ${movedPackages}/${requestedPackages}`,
      level,
      {
        additionalData: {
          targetWarehouseId: data.targetWarehouseId,
          requestMode: requestedPackageIds.length > 0 ? "manual" : "first-available",
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
