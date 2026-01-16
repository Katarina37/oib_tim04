import { TemperatureState } from "../enums/TemperatureState";
import { HumidityState } from "../enums/HumidityState";
import { PrecipitationState } from "../enums/PrecipitationState";

export interface WeatherDTO {
  id: number;
  date: string;
  temperatureC: number;
  humidityPct: number;
  precipitationMm: number;
  temperatureState: TemperatureState;
  humidityState: HumidityState;
  precipitationState: PrecipitationState;
  note?: string;
  createdByUserId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
