import { WeatherDTO, CreateWeatherDTO, WeatherEffectResultDTO } from "../../models/weather/WeatherDTO";

export interface IWeatherAPI {
  getAllWeather(token: string): Promise<WeatherDTO[]>;
  getWeatherByMonth(yearMonth: string, token: string): Promise<WeatherDTO[]>;
  getWeatherByDate(date: string, token: string): Promise<WeatherDTO>;
  saveWeather(data: CreateWeatherDTO, token: string): Promise<WeatherDTO>;
  applyWeatherEffects(date: string, token: string): Promise<WeatherEffectResultDTO>;
  deleteWeather(date: string, token: string): Promise<void>;
}
