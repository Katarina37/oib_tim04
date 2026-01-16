export enum HumidityState {
  DRY = "DRY",     // ≤ 35%
  OK = "OK",       // 36-70%
  HUMID = "HUMID", // ≥ 71%
}

export const calculateHumidityState = (humidityPct: number): HumidityState => {
  if (humidityPct <= 35) return HumidityState.DRY;
  if (humidityPct >= 71) return HumidityState.HUMID;
  return HumidityState.OK;
};
