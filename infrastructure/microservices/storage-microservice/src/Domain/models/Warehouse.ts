import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Package } from "./Package";

@Entity("skladiste")
export class Warehouse {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "naziv" })
    name: string;

    @Column({ name: "lokacija" })
    address: string;

    @Column({ name: "maksimalni_kapacitet" })
    capacity: number;

    @CreateDateColumn({ name: "datum_kreiranja" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "datum_azuriranja" })
    updatedAt!: Date;

    @OneToMany(() => Package, (p) => p.warehouse)
    packages: Package[];

}