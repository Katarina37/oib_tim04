import { PerformanceReportDTO } from "../../models/performance/PerformanceReportDTO";
import { CreatePerformanceParams } from "../../models/performance/CreatePerformanceParams";

export interface IPerformanceAPI {
    runSimulation(data: CreatePerformanceParams, token: string): Promise<PerformanceReportDTO>;
    getReports(token: string): Promise<PerformanceReportDTO[]>;
    exportPerformancePDF(id: number, token: string): Promise<Blob>;
}




