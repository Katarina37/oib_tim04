import { Repository } from "typeorm";
import { AppDataSource } from "../Database/DbConnectionPool";
import { IncidentStatus } from "../Domain/enums/IncidentStatus";
import { IncidentType } from "../Domain/enums/IncidentType";
import { IIncidentRepository } from "../Domain/services/IIncidentRepository";
import { SecurityIncident } from "../Domain/models/SecurityIncident";

export class IncidentRepository implements IIncidentRepository {
  private readonly repository: Repository<SecurityIncident>;

  constructor() {
    this.repository = AppDataSource.getRepository(SecurityIncident);
  }

  async findAll(): Promise<SecurityIncident[]> {
    return this.repository.find({ order: { detectedAt: "DESC" } });
  }

  async findByStatus(status: IncidentStatus): Promise<SecurityIncident[]> {
    return this.repository.find({ where: { status }, order: { detectedAt: "DESC" } });
  }

  async findById(id: number): Promise<SecurityIncident | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findOpenByTypeAndFingerprint(
    incidentType: IncidentType,
    fingerprint: string
  ): Promise<SecurityIncident | null> {
    return this.repository.findOne({
      where: {
        incidentType,
        fingerprint,
        status: IncidentStatus.OPEN,
      },
      order: {
        detectedAt: "DESC",
      },
    });
  }

  async save(incident: SecurityIncident): Promise<SecurityIncident> {
    return this.repository.save(incident);
  }
}
