import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("izvestaj_performansi") 
export class PerformanceReport {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 200 })
    naziv!: string;

    @Column({
        type: "enum",
        enum: ["distributivni_centar", "magacinski_centar"]
    })
    tip_algoritma!: string;

    @Column({ type: "int" })
    broj_ambalaza_po_slanju!: number;

    @Column({ type: "decimal", precision: 5, scale: 2 })
    vreme_obrade_sekunde!: number;

    @Column({ type: "decimal", precision: 5, scale: 2 })
    efikasnost_procenat!: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    brzina_obrade!: number; 

    @Column({ type: "json" })
    podaci_simulacije!: any; 

    @Column({ type: "text", nullable: true })
    zakljucci!: string;

    @CreateDateColumn()
    datum_kreiranja!: Date;
}