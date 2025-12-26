import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";


@Entity("fiscal_bills")
export class FiscalBill {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "tip_prodaje", length: 20 })
  saleType!: "retail" | "wholesale";

  @Column({
    name: "nacin_placanja",
    length: 30
  })
  paymentMethod!: "cash" | "bank_transfer" | "card";

  @Column({ name: "prodati_proizvodi", type: "json" })
  soldItems!: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;

  @Column({ name: "ukupan_iznos", type: "decimal", precision: 10, scale: 2 })
  totalAmount!: number;

  @CreateDateColumn({ name: "datum_kreiranja" })
  createdAt!: Date;

  @Column({ name: "korisnik_id", nullable: true})
  userId?: number;
  
}
