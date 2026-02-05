import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Sale } from "./Sale";

@Entity({ name: "stavka_racuna" })
export class SaleItem {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "parfem_id", type: "int" })
    perfumeId!: number;

    @Column({ name: "naziv_parfema", type: "varchar", length: 100 })
    perfumeName!: string;

    @Column({ name: "kolicina", type: "int" })
    quantity!: number;

    @Column({ name: "cena_po_komadu", 
              type: "decimal", 
              precision: 10, 
              scale: 2, 
              transformer: {
                to: (value: number) => value,
                from: (value: string) => parseFloat(value),
              } 
    })
    pricePerUnit!: number;

    @Column({ name: "ukupna_cena", 
              type: "decimal", 
              precision: 12, 
              scale: 2,
              transformer: {
                to: (value: number) => value,
                from: (value: string) => parseFloat(value),
              }  
    })
    totalPrice!: number;

    @ManyToOne(() => Sale, (sale) => sale.items)
    @JoinColumn({ name: "fiskalni_racun_id" })
    sale!: Sale;
}