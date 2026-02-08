import { RunSimulationDTO } from "../../Domain/DTOs/RunSimulationDTO";
import { PerformanceReport } from "../../Domain/models/PerformanceReport";
import { ExportPerformanceReportPdfResult } from "../usecases/ExportPerformanceReportPdfUseCase";

export interface IPerformanceApplicationService {
  runSimulation(request: RunSimulationDTO): Promise<PerformanceReport>;
  getReports(): Promise<PerformanceReport[]>;
  getReportById(id: number): Promise<PerformanceReport>;
  exportReportPdf(id: number): Promise<ExportPerformanceReportPdfResult>;
}
