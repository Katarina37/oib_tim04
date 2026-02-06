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
