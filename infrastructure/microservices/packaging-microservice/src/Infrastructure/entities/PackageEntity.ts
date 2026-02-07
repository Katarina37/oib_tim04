import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PackageState } from "../../Domain/enums/PackageState";
import { PackagePerfumeEntity } from "./PackagePerfumeEntity";
import { WarehouseEntity } from "./WarehouseEntity";

@Entity("ambalaza")
export class PackageEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "naziv" })
  name!: string;

  @Column({ name: "adresa_posiljaoca" })
  sender!: string;

  @Column({
    name: "status",
    type: "enum",
    enum: PackageState,
    default: PackageState.AVAILABLE,
  })
  state!: PackageState;

  @CreateDateColumn({ name: "datum_kreiranja" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "datum_azuriranja" })
  updatedAt!: Date;

  @ManyToOne(() => WarehouseEntity, (warehouse) => warehouse.packages, { nullable: true })
  @JoinColumn({ name: "skladiste_id" })
  warehouse!: WarehouseEntity | null;

  @OneToMany(() => PackagePerfumeEntity, (perfume) => perfume.package)
  perfumes!: PackagePerfumeEntity[];
}
