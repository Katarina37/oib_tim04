import { NotFoundError } from "../../Domain/errors/NotFoundError";
import { PerformanceReport } from "../../Domain/models/PerformanceReport";
import { IPerformanceRepository } from "../../Domain/repositories/IPerformanceRepository";

export class GetPerformanceReportByIdUseCase {
  constructor(private readonly repository: IPerformanceRepository) {}

  async execute(id: number): Promise<PerformanceReport> {
    const report = await this.repository.findById(id);
    if (!report) {
      throw new NotFoundError(`Izvestaj sa ID ${id} nije pronadjen.`);
    }

    return report;
  }
}
