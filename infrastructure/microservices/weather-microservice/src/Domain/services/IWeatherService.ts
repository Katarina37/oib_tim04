import { WeatherDTO } from "../DTOs/WeatherDTO";
import { CreateWeatherDTO } from "../DTOs/CreateWeatherDTO";
import { WeatherEffectResultDTO } from "../DTOs/WeatherEffectResultDTO";

export interface IWeatherService {
  getAllWeather(): Promise<WeatherDTO[]>;
  getWeatherByDate(date: string): Promise<WeatherDTO>;
  getWeatherByMonth(yearMonth: string): Promise<WeatherDTO[]>;
  saveWeather(data: CreateWeatherDTO, userId?: number): Promise<WeatherDTO>;
  deleteWeather(date: string, userId?: number): Promise<void>;
  applyWeatherEffects(
    date: string,
    userId?: number,
    demoDate?: string
  ): Promise<WeatherEffectResultDTO>;
}
