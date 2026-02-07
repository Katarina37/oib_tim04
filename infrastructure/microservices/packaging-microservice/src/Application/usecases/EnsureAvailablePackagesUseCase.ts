import { EnsureAvailablePackagesResultDTO } from "../../Domain/DTOs/EnsureAvailablePackagesResultDTO";
import { PackagePerfumesDTO } from "../../Domain/DTOs/PackagePerfumesDTO";
import { PackagePerfumesResultDTO } from "../../Domain/DTOs/PackagePerfumesResultDTO";
import { PackagingRepositoryPort } from "../ports/PackagingRepositoryPort";

export interface PackagePerfumesExecutor {
  execute(data: PackagePerfumesDTO): Promise<PackagePerfumesResultDTO>;
}

export class EnsureAvailablePackagesUseCase {
  constructor(
    private readonly repository: PackagingRepositoryPort,
    private readonly packagePerfumesUseCase: PackagePerfumesExecutor
  ) {}

  async execute(quantity: number): Promise<EnsureAvailablePackagesResultDTO> {
    const availableBefore = await this.repository.countAvailablePackages();
    if (availableBefore >= quantity) {
      return {
        requestedQuantity: quantity,
        availableBefore,
        availableAfter: availableBefore,
        createdPackages: 0,
      };
    }

    const missingQuantity = quantity - availableBefore;
    const packagingResult = await this.packagePerfumesUseCase.execute({ quantity: missingQuantity });
    const availableAfter = await this.repository.countAvailablePackages();

    return {
      requestedQuantity: quantity,
      availableBefore,
      availableAfter,
      createdPackages: packagingResult.packagedQuantity,
    };
  }
}
