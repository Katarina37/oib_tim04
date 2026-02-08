import { AlgorithmType } from "../../Domain/enums/AlgorithmType";
import { SimulationData } from "../../Domain/models/PerformanceReport";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { numericColumnTransformer } from "../repositories/NumericColumnTransformer";

@Entity("izvestaj_performansi")
export class PerformanceReportEntity {
  @PrimaryGeneratedColumn({ name: "id" })
  id!: number;

  @Column({ name: "naziv", type: "varchar", length: 200 })
  naziv!: string;

  @Column({
    name: "tip_algoritma",
    type: "enum",
    enum: AlgorithmType,
  })
  tipAlgoritma!: AlgorithmType;

  @Column({ name: "broj_ambalaza_po_slanju", type: "int" })
  brojAmbalazaPoSlanju!: number;

  @Column({
    name: "vreme_obrade_sekunde",
    type: "decimal",
    precision: 10,
    scale: 3,
    transformer: numericColumnTransformer,
  })
  vremeObradeSekunde!: number;

  @Column({
    name: "efikasnost_procenat",
    type: "decimal",
    precision: 7,
    scale: 2,
    transformer: numericColumnTransformer,
  })
  efikasnostProcenat!: number;

  @Column({
    name: "brzina_obrade",
    type: "decimal",
    precision: 10,
    scale: 3,
    transformer: numericColumnTransformer,
  })
  brzinaObrade!: number;

  @Column({ name: "podaci_simulacije", type: "json" })
  podaciSimulacije!: SimulationData;

  @Column({ name: "zakljucci", type: "text", nullable: true })
  zakljucci!: string | null;

  @CreateDateColumn({ name: "datum_kreiranja", type: "datetime" })
  datumKreiranja!: Date;
}
