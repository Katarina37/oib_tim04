import { PackagePerfumesDTO } from "../../Domain/DTOs/PackagePerfumesDTO";
import { PackagePerfumesResultDTO } from "../../Domain/DTOs/PackagePerfumesResultDTO";
import { LogLevel } from "../../Domain/enums/LogLevel";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { PackagingRepositoryPort } from "../ports/PackagingRepositoryPort";
import { ProcessingClientPort } from "../ports/ProcessingClientPort";
import { StorageClientPort } from "../ports/StorageClientPort";

const DEFAULT_PACKAGE_NAME = "Automatsko pakovanje";
const DEFAULT_SENDER_ADDRESS = "Prerada sirovina";

export class PackagePerfumesUseCase {
  constructor(
    private readonly repository: PackagingRepositoryPort,
    private readonly processingClient: ProcessingClientPort,
    private readonly storageClient: StorageClientPort,
    private readonly logger: ILoggerService
  ) {}

  async execute(data: PackagePerfumesDTO): Promise<PackagePerfumesResultDTO> {
    try {
      const perfumes = await this.processingClient.requestPerfumesForPackaging({
        quantity: data.quantity,
        perfumeType: data.perfumeType,
        perfumeName: data.perfumeName,
        bottleVolumeMl: data.bottleVolumeMl,
      });

      const perfumeIds = perfumes
        .map((perfume) => Number(perfume.id))
        .filter((id) => Number.isInteger(id) && id > 0);

      const packageIds = await this.repository.createPackagesFromPerfumes(perfumeIds, {
        packageName: this.resolvePackageName(data.packageName),
        senderAddress: this.resolveSenderAddress(data.senderAddress),
        targetWarehouseId: data.targetWarehouseId,
      });

      if (packageIds.length > 0) {
        await this.storageClient.syncCreatedPackages({
          packageIds,
          targetWarehouseId: data.targetWarehouseId,
        });
      }

      const packagedQuantity = packageIds.length;
      const missingQuantity = Math.max(0, data.quantity - packagedQuantity);
      const level = missingQuantity === 0 ? LogLevel.INFO : LogLevel.WARNING;

      await this.logger.log(
        `Pakovanje zavrseno: ${packagedQuantity}/${data.quantity} ambalaza`,
        level,
        {
          additionalData: {
            requestedQuantity: data.quantity,
            packagedQuantity,
            missingQuantity,
            targetWarehouseId: data.targetWarehouseId,
            perfumeType: data.perfumeType,
            perfumeName: data.perfumeName,
            bottleVolumeMl: data.bottleVolumeMl,
            packageIds,
          },
        }
      );

      return {
        requestedQuantity: data.quantity,
        packagedQuantity,
        missingQuantity,
        packageIds,
        targetWarehouseId: data.targetWarehouseId,
      };
    } catch (error) {
      await this.logger.log(
        `Greska pri pakovanju parfema: ${(error as Error).message}`,
        LogLevel.ERROR,
        {
          additionalData: {
            requestedQuantity: data.quantity,
            targetWarehouseId: data.targetWarehouseId,
            perfumeType: data.perfumeType,
            perfumeName: data.perfumeName,
            bottleVolumeMl: data.bottleVolumeMl,
          },
        }
      );
      throw error;
    }
  }

  private resolvePackageName(value?: string): string {
    const normalized = value?.trim();
    return normalized && normalized.length > 0 ? normalized : DEFAULT_PACKAGE_NAME;
  }

  private resolveSenderAddress(value?: string): string {
    const normalized = value?.trim();
    return normalized && normalized.length > 0 ? normalized : DEFAULT_SENDER_ADDRESS;
  }
}
