import { PerformanceReport } from "../../Domain/models/PerformanceReport";
import { IPerformanceRepository } from "../../Domain/repositories/IPerformanceRepository";

export class GetPerformanceReportsUseCase {
  constructor(private readonly repository: IPerformanceRepository) {}

  execute(): Promise<PerformanceReport[]> {
    return this.repository.findAll();
  }
}
