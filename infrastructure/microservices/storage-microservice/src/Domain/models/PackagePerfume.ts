import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Package } from "./Package";

@Entity("ambalaza_parfem")
export class PackagePerfume {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "ambalaza_id" })
    packageId: number;

    @Column({ name: "parfem_id" })
    perfumeId: number;

    @CreateDateColumn({ name: "datum_dodavanja" })
    addedAt!: Date;

    @ManyToOne(() => Package, (p) => p.perfumes)
    @JoinColumn({ name: "ambalaza_id" })
    package: Package;
}