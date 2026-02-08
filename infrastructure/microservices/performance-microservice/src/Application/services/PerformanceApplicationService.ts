import { RunSimulationDTO } from "../../Domain/DTOs/RunSimulationDTO";
import { PerformanceReport } from "../../Domain/models/PerformanceReport";
import { IPerformanceApplicationService } from "./IPerformanceApplicationService";
import { ExportPerformanceReportPdfResult, ExportPerformanceReportPdfUseCase } from "../usecases/ExportPerformanceReportPdfUseCase";
import { GetPerformanceReportByIdUseCase } from "../usecases/GetPerformanceReportByIdUseCase";
import { GetPerformanceReportsUseCase } from "../usecases/GetPerformanceReportsUseCase";
import { RunSimulationUseCase } from "../usecases/RunSimulationUseCase";

export class PerformanceApplicationService implements IPerformanceApplicationService {
  constructor(
    private readonly runSimulationUseCase: RunSimulationUseCase,
    private readonly getPerformanceReportsUseCase: GetPerformanceReportsUseCase,
    private readonly getPerformanceReportByIdUseCase: GetPerformanceReportByIdUseCase,
    private readonly exportPerformanceReportPdfUseCase: ExportPerformanceReportPdfUseCase
  ) {}

  runSimulation(request: RunSimulationDTO): Promise<PerformanceReport> {
    return this.runSimulationUseCase.execute(request);
  }

  getReports(): Promise<PerformanceReport[]> {
    return this.getPerformanceReportsUseCase.execute();
  }

  getReportById(id: number): Promise<PerformanceReport> {
    return this.getPerformanceReportByIdUseCase.execute(id);
  }

  exportReportPdf(id: number): Promise<ExportPerformanceReportPdfResult> {
    return this.exportPerformanceReportPdfUseCase.execute(id);
  }
}
