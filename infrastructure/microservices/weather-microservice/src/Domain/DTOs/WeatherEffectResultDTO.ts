export interface WeatherEffectResultDTO {
  affectedPlants: number;
  effectType: "damage" | "boost" | "drought" | "ideal";
  description: string;
  details?: Record<string, unknown>;
}
