<<<<<<< HEAD
export class FiscalBill {
  id!: number;

  saleType!: "retail" | "wholesale";

  paymentMethod!: "cash" | "bank_transfer" | "card";
=======
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";


//@Entity({ name: "fiskalni_racun", schema: "prodaja" })
/*export class FiscalBill {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "tip_prodaje", length: 20 })
  saleType!: "maloprodaja" | "veleprodaja";

  @Column({
    name: "nacin_placanja",
    length: 30
  })
  paymentMethod!: "gotovina" | "uplata_na_racun" | "karticno";
>>>>>>> 17e011c06949883abad9eac932eea24ddad2a45e

  soldItems!: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;

  totalAmount!: number;

  createdAt!: Date;

  userId?: number;
  
}*/
@Entity({ name: "prodaja.fiskalni_racun" })
export class FiscalBill {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "broj_racuna", length: 50, unique: true }) // Dodaj ovo!
  billNumber!: string;

  @Column({ name: "tip_prodaje" })
  saleType!: "maloprodaja" | "veleprodaja";

  @Column({ name: "nacin_placanja" })
  paymentMethod!: "gotovina" | "uplata_na_racun" | "karticno";

  @Column({ name: "ukupan_iznos", type: "decimal", precision: 12, scale: 2, transformer: {to: (value: number) => value, from: (value: string) => parseFloat(value)}})
  totalAmount!: number;

  @CreateDateColumn({ name: "datum_kreiranja" })
  createdAt!: Date;

  @Column({ name: "prodati_proizvodi", type: "json", nullable: true })
  soldItems!: any[];

  @Column({ name: "korisnik_id", nullable: true })
  userId?: number;
}
