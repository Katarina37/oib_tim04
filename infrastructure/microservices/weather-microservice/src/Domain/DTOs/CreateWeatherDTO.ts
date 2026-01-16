export interface CreateWeatherDTO {
  date: string; // Format: YYYY-MM-DD
  temperatureC: number;
  humidityPct: number;
  precipitationMm: number;
  note?: string;
}
