export enum TemperatureState {
  COLD = "COLD",       // ≤ 5°C
  MODERATE = "MODERATE", // 6-22°C
  HOT = "HOT",         // ≥ 23°C
}

export const calculateTemperatureState = (temperatureC: number): TemperatureState => {
  if (temperatureC <= 5) return TemperatureState.COLD;
  if (temperatureC >= 23) return TemperatureState.HOT;
  return TemperatureState.MODERATE;
};
