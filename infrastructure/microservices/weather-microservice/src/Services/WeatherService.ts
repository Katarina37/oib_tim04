import { IWeatherService } from "../Domain/services/IWeatherService";
import { IWeatherRepository } from "../Domain/services/IWeatherRepository";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { IProductionClient } from "../Domain/services/IProductionClient";
import { WeatherDTO } from "../Domain/DTOs/WeatherDTO";
import { CreateWeatherDTO } from "../Domain/DTOs/CreateWeatherDTO";
import { WeatherEffectResultDTO } from "../Domain/DTOs/WeatherEffectResultDTO";
import { WeatherDay } from "../Domain/models/WeatherDay";
import { LogLevel } from "../Domain/enums/LogLevel";
import { TemperatureState } from "../Domain/enums/TemperatureState";
import { HumidityState } from "../Domain/enums/HumidityState";
import { PrecipitationState } from "../Domain/enums/PrecipitationState";

export class WeatherService implements IWeatherService {
  private static readonly MIN_OIL_STRENGTH = 1.0;
  private static readonly MAX_OIL_STRENGTH = 5.0;

  constructor(
    private readonly weatherRepository: IWeatherRepository,
    private readonly logger: ILoggerService,
    private readonly productionClient: IProductionClient
  ) {}

  private toDTO(weather: WeatherDay): WeatherDTO {
    return {
      id: weather.id,
      date: weather.date,
      temperatureC: Number(weather.temperatureC),
      humidityPct: weather.humidityPct,
      precipitationMm: Number(weather.precipitationMm),
      temperatureState: weather.temperatureState,
      humidityState: weather.humidityState,
      precipitationState: weather.precipitationState,
      note: weather.note,
      createdByUserId: weather.createdByUserId,
      createdAt: weather.createdAt,
      updatedAt: weather.updatedAt,
    };
  }

  async getAllWeather(): Promise<WeatherDTO[]> {
    const weatherDays = await this.weatherRepository.findAll();
    return weatherDays.map((w) => this.toDTO(w));
  }

  async getWeatherByDate(date: string): Promise<WeatherDTO> {
    const weather = await this.weatherRepository.findByDate(date);
    if (!weather) {
      throw new Error(`Vremenski podaci za datum ${date} nisu pronadjeni`);
    }
    return this.toDTO(weather);
  }

  async getWeatherByMonth(yearMonth: string): Promise<WeatherDTO[]> {
    const weatherDays = await this.weatherRepository.findByMonth(yearMonth);
    return weatherDays.map((w) => this.toDTO(w));
  }

  async saveWeather(data: CreateWeatherDTO, userId?: number): Promise<WeatherDTO> {
    try {
      const weather = await this.weatherRepository.upsert(data, userId);

      await this.logger.log(
        `Sačuvani vremenski podaci za ${data.date}: ${data.temperatureC}°C, ${data.humidityPct}%, ${data.precipitationMm}mm`,
        LogLevel.INFO,
        { userId, additionalData: { date: data.date } }
      );

      return this.toDTO(weather);
    } catch (error) {
      await this.logger.log(
        `Greška pri čuvanju vremenskih podataka: ${(error as Error).message}`,
        LogLevel.ERROR,
        { userId, additionalData: { data } }
      );
      throw error;
    }
  }

  async deleteWeather(date: string): Promise<void> {
    try {
      await this.weatherRepository.delete(date);

      await this.logger.log(
        `Obrisani vremenski podaci za ${date}`,
        LogLevel.INFO,
        { additionalData: { date } }
      );
    } catch (error) {
      await this.logger.log(
        `Greška pri brisanju vremenskih podataka: ${(error as Error).message}`,
        LogLevel.ERROR,
        { additionalData: { date } }
      );
      throw error;
    }
  }

  async applyWeatherEffects(date: string): Promise<WeatherEffectResultDTO> {
    const weather = await this.weatherRepository.findByDate(date);
    if (!weather) {
      throw new Error(`Vremenski podaci za datum ${date} nisu pronadjeni`);
    }

    try {
      const plants = await this.productionClient.getPlantedPlants();
      
      if (plants.length === 0) {
        return {
          affectedPlants: 0,
          effectType: "ideal",
          description: "Nema posađenih biljaka za obradu",
        };
      }

      const { temperatureState, humidityState, precipitationState } = weather;

      // Rule 1: COLD + HUMID → 10% plants die
      if (temperatureState === TemperatureState.COLD && humidityState === HumidityState.HUMID) {
        const plantsToKill = Math.ceil(plants.length * 0.1);
        const killedPlants: number[] = [];

        for (let i = 0; i < Math.min(plantsToKill, plants.length); i++) {
          try {
            await this.productionClient.deletePlant(plants[i].id);
            killedPlants.push(plants[i].id);
          } catch (e) {
            console.error(`Failed to delete plant ${plants[i].id}:`, e);
          }
        }

        await this.logger.log(
          `Mraz i vlaga: ${killedPlants.length} biljaka propalo`,
          LogLevel.WARNING,
          { additionalData: { killedPlants, date } }
        );

        return {
          affectedPlants: killedPlants.length,
          effectType: "damage",
          description: `Hladno i vlažno vreme uzrokovalo propast ${killedPlants.length} biljaka`,
          details: { killedPlantIds: killedPlants },
        };
      }

      // Rule 2: HOT + OK + LIGHT → increase oil strength by +0.2
      if (
        temperatureState === TemperatureState.HOT &&
        humidityState === HumidityState.OK &&
        precipitationState === PrecipitationState.LIGHT
      ) {
        let boostedCount = 0;

        for (const plant of plants) {
          const currentStrength = Number(plant.oilStrength);
          const newStrength = Math.min(
            WeatherService.MAX_OIL_STRENGTH,
            currentStrength + 0.2
          );

          if (newStrength !== currentStrength) {
            try {
              await this.productionClient.updatePlantOilStrength(plant.id, newStrength);
              boostedCount++;
            } catch (e) {
              console.error(`Failed to update plant ${plant.id}:`, e);
            }
          }
        }

        await this.logger.log(
          `Toplo i blaga kiša: pojačana aromatičnost za ${boostedCount} biljaka`,
          LogLevel.INFO,
          { additionalData: { boostedCount, date } }
        );

        return {
          affectedPlants: boostedCount,
          effectType: "boost",
          description: `Idealni uslovi povećali jačinu ulja za ${boostedCount} biljaka`,
        };
      }

      // Rule 3: DRY + NONE → drought: decrease oil -0.3 and kill some plants
      if (humidityState === HumidityState.DRY && precipitationState === PrecipitationState.NONE) {
        let affectedCount = 0;
        const plantsToKill = Math.ceil(plants.length * 0.05);
        const killedPlants: number[] = [];

        // Decrease oil strength
        for (const plant of plants) {
          const currentStrength = Number(plant.oilStrength);
          const newStrength = Math.max(
            WeatherService.MIN_OIL_STRENGTH,
            currentStrength - 0.3
          );

          if (newStrength !== currentStrength) {
            try {
              await this.productionClient.updatePlantOilStrength(plant.id, newStrength);
              affectedCount++;
            } catch (e) {
              console.error(`Failed to update plant ${plant.id}:`, e);
            }
          }
        }

        // Kill some plants
        for (let i = 0; i < Math.min(plantsToKill, plants.length); i++) {
          try {
            await this.productionClient.deletePlant(plants[i].id);
            killedPlants.push(plants[i].id);
          } catch (e) {
            console.error(`Failed to delete plant ${plants[i].id}:`, e);
          }
        }

        await this.logger.log(
          `Suša: ${killedPlants.length} biljaka uginulo, ${affectedCount} izgubilo jačinu ulja`,
          LogLevel.WARNING,
          { additionalData: { killedPlants, affectedCount, date } }
        );

        return {
          affectedPlants: affectedCount + killedPlants.length,
          effectType: "drought",
          description: `Suša: ${killedPlants.length} biljaka uginulo, ${affectedCount} smanjene jačine ulja`,
          details: { killedPlantIds: killedPlants, oilReduced: affectedCount },
        };
      }

      // Rule 4: MODERATE + OK → ideal conditions: duplicate 1 plant
      if (temperatureState === TemperatureState.MODERATE && humidityState === HumidityState.OK) {
        if (plants.length > 0) {
          try {
            const randomPlant = plants[Math.floor(Math.random() * plants.length)];
            await this.productionClient.duplicatePlant(randomPlant.id);

            await this.logger.log(
              `Idealni uslovi: biljka ${randomPlant.commonName} se umnožila`,
              LogLevel.INFO,
              { additionalData: { duplicatedPlantId: randomPlant.id, date } }
            );

            return {
              affectedPlants: 1,
              effectType: "ideal",
              description: `Idealni uslovi omogućili umnožavanje biljke ${randomPlant.commonName}`,
              details: { duplicatedPlant: randomPlant.commonName },
            };
          } catch (e) {
            console.error("Failed to duplicate plant:", e);
          }
        }
      }

      // No effect
      return {
        affectedPlants: 0,
        effectType: "ideal",
        description: "Vremenski uslovi nisu imali značajan uticaj na biljke",
      };
    } catch (error) {
      await this.logger.log(
        `Greška pri primeni vremenskih efekata: ${(error as Error).message}`,
        LogLevel.ERROR,
        { additionalData: { date } }
      );
      throw error;
    }
  }
}
