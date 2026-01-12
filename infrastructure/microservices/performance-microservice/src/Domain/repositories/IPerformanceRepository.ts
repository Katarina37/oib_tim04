import { PerformanceReport } from "../models/PerformanceReport";

export interface IPerformanceRepository {
    saveReport(report: PerformanceReport): Promise<PerformanceReport>;
    findAll(): Promise<PerformanceReport[]>;
    findById(id: number): Promise<PerformanceReport | null>;
}