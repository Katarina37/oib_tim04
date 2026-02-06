export enum TemperatureState {
  COLD = "COLD",
  MODERATE = "MODERATE",
  HOT = "HOT",
}

export enum HumidityState {
  DRY = "DRY",
  OK = "OK",
  HUMID = "HUMID",
}

export enum PrecipitationState {
  NONE = "NONE",
  LIGHT = "LIGHT",
  HEAVY = "HEAVY",
}

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
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWeatherDTO {
  date: string;
  temperatureC: number;
  humidityPct: number;
  precipitationMm: number;
  note?: string;
}

export type PlantEffectAction = "removed" | "boosted" | "oil-reduced" | "duplicated";

export interface PlantEffectDetail {
  id: number;
  commonName: string;
  action: PlantEffectAction;
  previousOilStrength?: number;
  newOilStrength?: number;
}

export interface WeatherEffectResultDTO {
  affectedPlants: number;
  effectType: "damage" | "boost" | "drought" | "ideal";
  description: string;
  affectedPlantDetails?: PlantEffectDetail[];
  details?: Record<string, unknown>;
}
