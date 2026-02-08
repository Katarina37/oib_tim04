import { PerformanceReport } from "../models/PerformanceReport";

export interface IPdfGenerator {
  generate(report: PerformanceReport): Promise<Buffer>;
}
