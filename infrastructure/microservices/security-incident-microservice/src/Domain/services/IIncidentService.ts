import { IncidentStatus } from "../enums/IncidentStatus";
import { SecurityIncidentDTO } from "../DTOs/SecurityIncidentDTO";

export interface ScanResult {
  created: number;
  updated: number;
  evaluatedLogs: number;
}

export interface IIncidentService {
  getAll(): Promise<SecurityIncidentDTO[]>;
  getByStatus(status: IncidentStatus): Promise<SecurityIncidentDTO[]>;
  getById(id: number): Promise<SecurityIncidentDTO>;
  updateStatus(id: number, status: IncidentStatus): Promise<SecurityIncidentDTO>;
  runScan(lookbackMinutes?: number): Promise<ScanResult>;
}
