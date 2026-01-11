import { IPerformanceRepository } from "../../Domain/repositories/IPerformanceRepository";
import { PerformanceReport } from "../../Domain/models/PerformanceReport";
import { Db } from "../../Database/DBConnectionPool";

export class PerformanceRepository implements IPerformanceRepository {
    
    private dbRepo = Db.getRepository(PerformanceReport);

    async saveReport(report: PerformanceReport): Promise<PerformanceReport> {
        return await this.dbRepo.save(report);
    }

    async findAll(): Promise<PerformanceReport[]> {
        return await this.dbRepo.find({ order: { datum_kreiranja: "DESC" } });
    }

    async findById(id: number): Promise<PerformanceReport | null> {
        return await this.dbRepo.findOneBy({ id });
    }
}


