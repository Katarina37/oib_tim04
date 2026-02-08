import { PerformanceReport } from "../../Domain/models/PerformanceReport";
import { IPdfGenerator } from "../../Domain/services/IPdfGenerator";
import { GetPerformanceReportByIdUseCase } from "./GetPerformanceReportByIdUseCase";

export interface ExportPerformanceReportPdfResult {
  report: PerformanceReport;
  pdfBuffer: Buffer;
}

export class ExportPerformanceReportPdfUseCase {
  constructor(
    private readonly getPerformanceReportByIdUseCase: GetPerformanceReportByIdUseCase,
    private readonly pdfGenerator: IPdfGenerator
  ) {}

  async execute(id: number): Promise<ExportPerformanceReportPdfResult> {
    const report = await this.getPerformanceReportByIdUseCase.execute(id);
    const pdfBuffer = await this.pdfGenerator.generate(report);

    return { report, pdfBuffer };
  }
}
