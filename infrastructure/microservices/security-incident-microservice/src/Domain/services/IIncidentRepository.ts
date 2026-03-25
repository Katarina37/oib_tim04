import { IncidentStatus } from "../enums/IncidentStatus";
import { IncidentType } from "../enums/IncidentType";
import { SecurityIncident } from "../models/SecurityIncident";

export interface IIncidentRepository {
  findAll(): Promise<SecurityIncident[]>;
  findByStatus(status: IncidentStatus): Promise<SecurityIncident[]>;
  findById(id: number): Promise<SecurityIncident | null>;
  findOpenByTypeAndFingerprint(
    incidentType: IncidentType,
    fingerprint: string
  ): Promise<SecurityIncident | null>;
  save(incident: SecurityIncident): Promise<SecurityIncident>;
}
