import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PackageEntity } from "./PackageEntity";

@Entity("skladiste")
export class WarehouseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "naziv" })
  name!: string;

  @Column({ name: "lokacija" })
  address!: string;

  @Column({ name: "maksimalni_kapacitet" })
  capacity!: number;

  @CreateDateColumn({ name: "datum_kreiranja" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "datum_azuriranja" })
  updatedAt!: Date;

  @OneToMany(() => PackageEntity, (packaging) => packaging.warehouse)
  packages!: PackageEntity[];
}
