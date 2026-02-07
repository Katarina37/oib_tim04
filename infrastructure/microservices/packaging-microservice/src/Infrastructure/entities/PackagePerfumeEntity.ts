import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { PackageEntity } from "./PackageEntity";

@Entity("ambalaza_parfem")
export class PackagePerfumeEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "ambalaza_id" })
  packageId!: number;

  @Column({ name: "parfem_id" })
  perfumeId!: number;

  @CreateDateColumn({ name: "datum_dodavanja" })
  addedAt!: Date;

  @ManyToOne(() => PackageEntity, (packaging) => packaging.perfumes)
  @JoinColumn({ name: "ambalaza_id" })
  package!: PackageEntity;
}
