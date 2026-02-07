import { OverviewDTO } from "../../Domain/DTOs/OverviewDTO";
import { PackagingRepositoryPort } from "../ports/PackagingRepositoryPort";

export class GetPackagingOverviewUseCase {
  constructor(private readonly repository: PackagingRepositoryPort) {}

  async execute(): Promise<OverviewDTO> {
    const [warehouses, packages] = await Promise.all([
      this.repository.getWarehouses(),
      this.repository.getPackages(),
    ]);

    return { warehouses, packages };
  }
}
