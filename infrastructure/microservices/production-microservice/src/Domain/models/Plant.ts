import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { PlantState } from "../enums/PlantState";

@Entity("biljka")
export class Plant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "opsti_naziv", length: 100 })
  commonName!: string;

  @Column({
    name: "jacina_aromaticnih_ulja",
    type: "decimal",
    precision: 2,
    scale: 1,
  })
  oilStrength!: number;

  @Column({ name: "latinski_naziv", length: 150 })
  latinName!: string;

  @Column({ name: "zemlja_porekla", length: 100 })
  countryOfOrigin!: string;

  @Column({
    name: "stanje",
    type: "enum",
    enum: PlantState,
    default: PlantState.PLANTED,
  })
  state!: PlantState;

  @CreateDateColumn({ name: "datum_kreiranja" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "datum_azuriranja" })
  updatedAt!: Date;
}