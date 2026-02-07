import { AvailablePackagesDTO } from "../../Domain/DTOs/AvailablePackagesDTO";
import { PackagingRepositoryPort } from "../ports/PackagingRepositoryPort";

export class GetAvailablePackagesUseCase {
  constructor(private readonly repository: PackagingRepositoryPort) {}

  async execute(): Promise<AvailablePackagesDTO> {
    const available = await this.repository.countAvailablePackages();
    return {
      distributiveCenter: available,
      warehouseCenter: available,
    };
  }
}
