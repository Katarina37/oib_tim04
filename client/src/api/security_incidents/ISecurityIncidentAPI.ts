import { IncidentStatus } from "../../models/security_incidents/IncidentStatus";
import { SecurityIncidentDTO } from "../../models/security_incidents/SecurityIncidentDTO";
import { SecurityIncidentScanResultDTO } from "../../models/security_incidents/SecurityIncidentScanResultDTO";

export interface ISecurityIncidentAPI {
  getAll(token: string): Promise<SecurityIncidentDTO[]>;
  getOpen(token: string): Promise<SecurityIncidentDTO[]>;
  getById(id: number, token: string): Promise<SecurityIncidentDTO>;
  updateStatus(id: number, status: IncidentStatus, token: string): Promise<SecurityIncidentDTO>;
  runScan(lookbackMinutes: number | undefined, token: string): Promise<SecurityIncidentScanResultDTO>;
}
