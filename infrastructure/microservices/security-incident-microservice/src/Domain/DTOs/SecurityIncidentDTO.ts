import { IncidentSeverity } from "../enums/IncidentSeverity";
import { IncidentStatus } from "../enums/IncidentStatus";
import { IncidentType } from "../enums/IncidentType";

export interface SecurityIncidentDTO {
  id: number;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  fingerprint: string;
  sourceMicroservice: string | null;
  detectedAt: string;
  lastMatchedAt: string;
  resolvedAt: string | null;
  occurrenceCount: number;
  evidence: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
