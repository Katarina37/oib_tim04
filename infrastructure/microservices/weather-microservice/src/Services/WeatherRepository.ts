import { Repository, Between, Like } from "typeorm";
import { WeatherDay } from "../Domain/models/WeatherDay";
import { IWeatherRepository } from "../Domain/services/IWeatherRepository";
import { CreateWeatherDTO } from "../Domain/DTOs/CreateWeatherDTO";
import { AppDataSource } from "../Database/DbConnectionPool";
import { calculateTemperatureState } from "../Domain/enums/TemperatureState";
import { calculateHumidityState } from "../Domain/enums/HumidityState";
import { calculatePrecipitationState } from "../Domain/enums/PrecipitationState";

export class WeatherRepository implements IWeatherRepository {
  private readonly repository: Repository<WeatherDay>;

  constructor() {
    this.repository = AppDataSource.getRepository(WeatherDay);
  }

  async findAll(): Promise<WeatherDay[]> {
    return this.repository.find({
      order: { date: "DESC" },
    });
  }

  async findByDate(date: string): Promise<WeatherDay | null> {
    return this.repository.findOneBy({ date });
  }

  async findByMonth(yearMonth: string): Promise<WeatherDay[]> {
    // yearMonth format: YYYY-MM
    return this.repository.find({
      where: {
        date: Like(`${yearMonth}%`),
      },
      order: { date: "ASC" },
    });
  }

  async findByDateRange(startDate: string, endDate: string): Promise<WeatherDay[]> {
    return this.repository.find({
      where: {
        date: Between(startDate, endDate),
      },
      order: { date: "ASC" },
    });
  }

  async upsert(data: CreateWeatherDTO, userId?: number): Promise<WeatherDay> {
    const existingWeather = await this.findByDate(data.date);

    const temperatureState = calculateTemperatureState(data.temperatureC);
    const humidityState = calculateHumidityState(data.humidityPct);
    const precipitationState = calculatePrecipitationState(data.precipitationMm);

    if (existingWeather) {
      // Update existing record
      existingWeather.temperatureC = data.temperatureC;
      existingWeather.humidityPct = data.humidityPct;
      existingWeather.precipitationMm = data.precipitationMm;
      existingWeather.temperatureState = temperatureState;
      existingWeather.humidityState = humidityState;
      existingWeather.precipitationState = precipitationState;
      existingWeather.note = data.note;
      if (userId) {
        existingWeather.createdByUserId = userId;
      }

      return this.repository.save(existingWeather);
    }

    // Create new record
    const weatherDay = this.repository.create({
      date: data.date,
      temperatureC: data.temperatureC,
      humidityPct: data.humidityPct,
      precipitationMm: data.precipitationMm,
      temperatureState,
      humidityState,
      precipitationState,
      note: data.note,
      createdByUserId: userId,
    });

    return this.repository.save(weatherDay);
  }

  async delete(date: string): Promise<void> {
    const result = await this.repository.delete({ date });

    if (result.affected === 0) {
      throw new Error(`Vremenski podaci za datum ${date} nisu pronadjeni`);
    }
  }
}
