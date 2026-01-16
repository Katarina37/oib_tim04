import { WeatherDay } from "../models/WeatherDay";
import { CreateWeatherDTO } from "../DTOs/CreateWeatherDTO";

export interface IWeatherRepository {
  findAll(): Promise<WeatherDay[]>;
  findByDate(date: string): Promise<WeatherDay | null>;
  findByMonth(yearMonth: string): Promise<WeatherDay[]>; // Format: YYYY-MM
  findByDateRange(startDate: string, endDate: string): Promise<WeatherDay[]>;
  upsert(data: CreateWeatherDTO, userId?: number): Promise<WeatherDay>;
  delete(date: string): Promise<void>;
}
