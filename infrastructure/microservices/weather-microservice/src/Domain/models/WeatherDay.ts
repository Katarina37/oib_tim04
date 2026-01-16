import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from "typeorm";
import { TemperatureState } from "../enums/TemperatureState";
import { HumidityState } from "../enums/HumidityState";
import { PrecipitationState } from "../enums/PrecipitationState";

@Entity("vremenski_dan")
@Unique(["date"])
export class WeatherDay {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "datum", type: "date" })
  date!: string; // Format: YYYY-MM-DD

  @Column({ name: "temperatura_c", type: "decimal", precision: 4, scale: 1 })
  temperatureC!: number;

  @Column({ name: "vlaznost_pct", type: "int" })
  humidityPct!: number;

  @Column({ name: "padavine_mm", type: "decimal", precision: 5, scale: 1 })
  precipitationMm!: number;

  @Column({
    name: "stanje_temperature",
    type: "enum",
    enum: TemperatureState,
  })
  temperatureState!: TemperatureState;

  @Column({
    name: "stanje_vlaznosti",
    type: "enum",
    enum: HumidityState,
  })
  humidityState!: HumidityState;

  @Column({
    name: "stanje_padavina",
    type: "enum",
    enum: PrecipitationState,
  })
  precipitationState!: PrecipitationState;

  @Column({ name: "napomena", type: "text", nullable: true })
  note?: string;

  @Column({ name: "kreirao_korisnik_id", type: "int", nullable: true })
  createdByUserId?: number;

  @CreateDateColumn({ name: "datum_kreiranja" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "datum_azuriranja" })
  updatedAt!: Date;
}
