export enum PrecipitationState {
  NONE = "NONE",   // 0 mm
  LIGHT = "LIGHT", // 1-10 mm
  HEAVY = "HEAVY", // ≥ 11 mm
}

export const calculatePrecipitationState = (precipitationMm: number): PrecipitationState => {
  if (precipitationMm === 0) return PrecipitationState.NONE;
  if (precipitationMm <= 10) return PrecipitationState.LIGHT;
  return PrecipitationState.HEAVY;
};
