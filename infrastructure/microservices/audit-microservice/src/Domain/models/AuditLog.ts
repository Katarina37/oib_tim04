import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { LogLevel } from "../enums/LogLevel";

@Entity("audit_log")
export class AuditLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "enum", enum: LogLevel, name: "tip_zapisa" })
  tipZapisa!: LogLevel;

  @CreateDateColumn({ name: "datum_vreme" })
  datumVreme!: Date;

  @Column({ type: "text" })
  opis!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  mikroservis!: string | null;

  @Column({ type: "int", nullable: true, name: "korisnik_id" })
  korisnikId!: number | null;

  @Column({ type: "varchar", length: 45, nullable: true, name: "ip_adresa" })
  ipAdresa!: string | null;

  @Column({ type: "json", nullable: true, name: "dodatni_podaci" })
  dodatniPodaci!: object | null;
}