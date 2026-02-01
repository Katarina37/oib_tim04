import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Warehouse } from "./Warehouse";
import { PackageState } from "../enums/PackageState";
import { PackagePerfume } from "./PackagePerfume";

@Entity("ambalaza")
export class Package {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "naziv" })
    name: string;

    @Column({ name: "adresa_posiljaoca" })
    sender: string;

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

    @ManyToOne(() => Warehouse, (w) => w.packages, { nullable: true })
    @JoinColumn({ name: "skladiste_id" })
    warehouse: Warehouse | null;

    @OneToMany(() => PackagePerfume, (pp) => pp.package)
    perfumes: PackagePerfume[];
}