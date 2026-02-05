import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PaymentMethod } from "../enums/PaymentMethod";
import { SaleType } from "../enums/SaleType";
import { SaleItem } from "./SaleItem";

@Entity({ name: "fiskalni_racun" })
export class Sale {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "broj_racuna", type: "varchar", length: 255, nullable: true })
  billNumber!: string;

  @Column({ name: "tip_prodaje", type: "enum", default: SaleType.RETAIL, enum: SaleType })  
  salesType!: SaleType;

  @Column({ name: "nacin_placanja", type: "enum", default: PaymentMethod.CASH, enum: PaymentMethod })  
  paymentMethod!: PaymentMethod;

  @Column({ name: "ukupan_iznos", 
            type: "decimal", 
            precision: 12, 
            scale: 2,
            transformer: {
              to: (value: number) => value,
              from: (value: string) => parseFloat(value),
            }  
  })
  totalAmount!: number;

  @CreateDateColumn({ name: "datum_kreiranja" })
  createdAt!: Date;

  @OneToMany(() => SaleItem, (saleItem) => saleItem.sale, { cascade: true })
  items!: SaleItem[];
}