import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("sales_reports")
export class SalesReportEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "tip_perioda", length: 20 })
  periodType!: "daily" | "weekly" | "monthly" | "yearly" | "total";

  @Column({ name: "vrednost_perioda", length: 50 })
  periodValue!: string;

  @Column({ name: "ukupna_prodaja", type: "decimal", precision: 12, scale: 2 })
  totalSales!: number;

  @Column({ name: "broj_prodatih_jedinica", type: "int" })
  totalUnitsSold!: number;

  @Column({ name: "zarada", type: "decimal", precision: 12, scale: 2 })
  revenue!: number;

  @Column({ name: "detalji", type: "json", nullable: true })
  details?: Record<string, unknown>;

  @Column({ name: "generisan_datum" })
  generatedAt!: Date;
}
