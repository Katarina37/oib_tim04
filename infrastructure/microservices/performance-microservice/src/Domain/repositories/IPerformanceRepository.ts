import { NewPerformanceReport, PerformanceReport } from "../models/PerformanceReport";

export interface IPerformanceRepository {
  save(report: NewPerformanceReport): Promise<PerformanceReport>;
  findAll(): Promise<PerformanceReport[]>;
  findById(id: number): Promise<PerformanceReport | null>;
}
