import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("item_co_occurrence")
export class ItemCoOccurrenceEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "parfem_id_1" })
  parfemId1!: number;

  @Column({ name: "parfem_id_2" })
  parfemId2!: number;

  @Column({ name: "zajednicki_broj_kupovina", default: 0 })
  zajednickiBrojKupovina!: number;

  @UpdateDateColumn({ name: "datum_azuriranja" })
  datumAzuriranja!: Date;
}