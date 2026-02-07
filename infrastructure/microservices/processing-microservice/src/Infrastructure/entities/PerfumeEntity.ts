import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PerfumeType } from "../../Domain/enums/PerfumeType";

@Entity("parfem")
export class PerfumeEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "naziv", length: 100 })
  name!: string;

  @Column({ name: "tip", type: "enum", enum: PerfumeType })
  type!: PerfumeType;

  @Column({ name: "neto_kolicina", type: "int" })
  netVolumeMl!: number;

  @Column({ name: "serijski_broj", length: 50, unique: true })
  serialNumber!: string;

  @Column({ name: "biljka_id", type: "int" })
  plantId!: number;

  @Column({ name: "rok_trajanja", type: "date" })
  expiryDate!: string;

  @Column({ name: "spakovan", type: "boolean", default: false })
  isPackaged!: boolean;

  @CreateDateColumn({ name: "datum_kreiranja" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "datum_azuriranja" })
  updatedAt!: Date;
}
