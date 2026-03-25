import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { IncidentSeverity } from "../enums/IncidentSeverity";
import { IncidentStatus } from "../enums/IncidentStatus";
import { IncidentType } from "../enums/IncidentType";

@Entity("security_incident")
export class SecurityIncident {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "enum", enum: IncidentType, name: "incident_type" })
  incidentType!: IncidentType;

  @Column({ type: "enum", enum: IncidentSeverity })
  severity!: IncidentSeverity;

  @Column({ type: "enum", enum: IncidentStatus })
  status!: IncidentStatus;

  @Column({ type: "varchar", length: 191 })
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "varchar", length: 191 })
  fingerprint!: string;

  @Column({ type: "varchar", length: 100, name: "source_microservice", nullable: true })
  sourceMicroservice!: string | null;

  @Column({ type: "datetime", name: "detected_at" })
  detectedAt!: Date;

  @Column({ type: "datetime", name: "last_matched_at" })
  lastMatchedAt!: Date;

  @Column({ type: "datetime", name: "resolved_at", nullable: true })
  resolvedAt!: Date | null;

  @Column({ type: "int", name: "occurrence_count", default: 1 })
  occurrenceCount!: number;

  @Column({ type: "json", nullable: true })
  evidence!: Record<string, unknown> | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
