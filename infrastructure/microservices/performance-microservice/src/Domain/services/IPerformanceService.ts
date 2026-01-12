import { PerformanceReport } from "../models/PerformanceReport";
import { RunSimulationDTO } from "../DTOs/RunSimulationDTO";

export interface IPerformanceService {
    runSimulation(data: RunSimulationDTO): Promise<PerformanceReport>;
    getAllReports(): Promise<PerformanceReport[]>;
    getReportById(id: number): Promise<PerformanceReport | null>;
}