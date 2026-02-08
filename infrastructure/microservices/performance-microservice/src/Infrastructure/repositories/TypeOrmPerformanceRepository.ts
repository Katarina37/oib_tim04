import { Db } from "../../Database/DBConnectionPool";
import { NewPerformanceReport, PerformanceReport } from "../../Domain/models/PerformanceReport";
import { IPerformanceRepository } from "../../Domain/repositories/IPerformanceRepository";
import { PerformanceReportEntity } from "../entities/PerformanceReportEntity";

export class TypeOrmPerformanceRepository implements IPerformanceRepository {
  private readonly repository = Db.getRepository(PerformanceReportEntity);

  async save(report: NewPerformanceReport): Promise<PerformanceReport> {
    const entity = this.repository.create({
      naziv: report.naziv,
      tipAlgoritma: report.tipAlgoritma,
      brojAmbalazaPoSlanju: report.brojAmbalazaPoSlanju,
      vremeObradeSekunde: report.vremeObradeSekunde,
      efikasnostProcenat: report.efikasnostProcenat,
      brzinaObrade: report.brzinaObrade,
      podaciSimulacije: report.podaciSimulacije,
      zakljucci: report.zakljucci,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findAll(): Promise<PerformanceReport[]> {
    const entities = await this.repository.find({
      order: {
        datumKreiranja: "DESC",
      },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  async findById(id: number): Promise<PerformanceReport | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    return entity ? this.toDomain(entity) : null;
  }

  private toDomain(entity: PerformanceReportEntity): PerformanceReport {
    return {
      id: entity.id,
      naziv: entity.naziv,
      tipAlgoritma: entity.tipAlgoritma,
      brojAmbalazaPoSlanju: entity.brojAmbalazaPoSlanju,
      vremeObradeSekunde: entity.vremeObradeSekunde,
      efikasnostProcenat: entity.efikasnostProcenat,
      brzinaObrade: entity.brzinaObrade,
      podaciSimulacije: entity.podaciSimulacije,
      zakljucci: entity.zakljucci ?? "",
      datumKreiranja: entity.datumKreiranja,
    };
  }
}
