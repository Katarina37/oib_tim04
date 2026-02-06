import { IWeatherService } from "../Domain/services/IWeatherService";
import { IWeatherRepository } from "../Domain/services/IWeatherRepository";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { IProductionClient } from "../Domain/services/IProductionClient";
import { WeatherDTO } from "../Domain/DTOs/WeatherDTO";
import { CreateWeatherDTO } from "../Domain/DTOs/CreateWeatherDTO";
import {
  PlantEffectAction,
  PlantEffectDetail,
  WeatherEffectResultDTO,
} from "../Domain/DTOs/WeatherEffectResultDTO";
import { WeatherDay } from "../Domain/models/WeatherDay";
import { LogLevel } from "../Domain/enums/LogLevel";
import { TemperatureState } from "../Domain/enums/TemperatureState";
import { HumidityState } from "../Domain/enums/HumidityState";
import { PrecipitationState } from "../Domain/enums/PrecipitationState";
import { InvalidDemoDateError } from "../Domain/errors/InvalidDemoDateError";
import { WeatherEffectDateNotAllowedError } from "../Domain/errors/WeatherEffectDateNotAllowedError";

export class WeatherService implements IWeatherService {
  private static readonly MIN_OIL_STRENGTH = 1.0;
  private static readonly MAX_OIL_STRENGTH = 5.0;
  private static readonly DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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

  private buildPlantEffectDetail(
    plant: { id: number; commonName: string },
    action: PlantEffectAction,
    previousOilStrength?: number,
    newOilStrength?: number
  ): PlantEffectDetail {
    const detail: PlantEffectDetail = {
      id: plant.id,
      commonName: plant.commonName,
      action,
    };

    if (previousOilStrength !== undefined) {
      detail.previousOilStrength = previousOilStrength;
    }

    if (newOilStrength !== undefined) {
      detail.newOilStrength = newOilStrength;
    }

    return detail;
  }

  private static formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private static isValidDateString(value: string): boolean {
    if (!WeatherService.DATE_REGEX.test(value)) {
      return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }

  private resolveEffectiveDate(
    demoDate?: string
  ): { date: string; isDemoDate: boolean } {
    const normalizedDemoDate = demoDate?.trim();
    if (normalizedDemoDate) {
      if (!WeatherService.isValidDateString(normalizedDemoDate)) {
        throw new InvalidDemoDateError(normalizedDemoDate);
      }
      return { date: normalizedDemoDate, isDemoDate: true };
    }

    return { date: WeatherService.formatLocalDate(new Date()), isDemoDate: false };
  }

  private ensureEffectsDateAllowed(date: string, demoDate?: string): void {
    const { date: effectiveDate, isDemoDate } = this.resolveEffectiveDate(demoDate);

    if (date !== effectiveDate) {
      throw new WeatherEffectDateNotAllowedError(effectiveDate, date, isDemoDate);
    }
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

  async deleteWeather(date: string, userId?: number): Promise<void> {
    try {
      await this.weatherRepository.delete(date);

      await this.logger.log(
        `Obrisani vremenski podaci za ${date}`,
        LogLevel.INFO,
        { userId, additionalData: { date } }
      );
    } catch (error) {
      await this.logger.log(
        `Greška pri brisanju vremenskih podataka: ${(error as Error).message}`,
        LogLevel.ERROR,
        { userId, additionalData: { date } }
      );
      throw error;
    }
  }

  async applyWeatherEffects(
    date: string,
    userId?: number,
    demoDate?: string
  ): Promise<WeatherEffectResultDTO> {
    this.ensureEffectsDateAllowed(date, demoDate);

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
          affectedPlantDetails: [],
        };
      }

      const { temperatureState, humidityState, precipitationState } = weather;

      // Rule 1: COLD + HUMID → 10% plants die
      if (temperatureState === TemperatureState.COLD && humidityState === HumidityState.HUMID) {
        const plantsToKill = Math.ceil(plants.length * 0.1);
        const killedPlants: number[] = [];
        const killedPlantDetails: PlantEffectDetail[] = [];

        for (let i = 0; i < Math.min(plantsToKill, plants.length); i++) {
          try {
            await this.productionClient.deletePlant(plants[i].id);
            killedPlants.push(plants[i].id);
            killedPlantDetails.push(
              this.buildPlantEffectDetail(plants[i], "removed")
            );
          } catch (e) {
            console.error(`Failed to delete plant ${plants[i].id}:`, e);
          }
        }

        await this.logger.log(
          `Mraz i vlaga: ${killedPlants.length} biljaka propalo`,
          LogLevel.WARNING,
          {
            userId,
            additionalData: {
              killedPlantIds: killedPlants,
              killedPlantNames: killedPlantDetails.map((plant) => plant.commonName),
              date,
            },
          }
        );

        return {
          affectedPlants: killedPlantDetails.length,
          effectType: "damage",
          description: `Hladno i vlažno vreme uzrokovalo propast ${killedPlants.length} biljaka`,
          affectedPlantDetails: killedPlantDetails,
          details: {
            killedPlantIds: killedPlants,
            killedPlantNames: killedPlantDetails.map((plant) => plant.commonName),
          },
        };
      }

      // Rule 2: HOT + OK + LIGHT → increase oil strength by +0.2
      if (
        temperatureState === TemperatureState.HOT &&
        humidityState === HumidityState.OK &&
        precipitationState === PrecipitationState.LIGHT
      ) {
        let boostedCount = 0;
        const boostedPlantDetails: PlantEffectDetail[] = [];

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
              boostedPlantDetails.push(
                this.buildPlantEffectDetail(
                  plant,
                  "boosted",
                  currentStrength,
                  newStrength
                )
              );
            } catch (e) {
              console.error(`Failed to update plant ${plant.id}:`, e);
            }
          }
        }

        await this.logger.log(
          `Toplo i blaga kiša: pojačana aromatičnost za ${boostedCount} biljaka`,
          LogLevel.INFO,
          {
            userId,
            additionalData: {
              boostedCount,
              boostedPlantIds: boostedPlantDetails.map((plant) => plant.id),
              date,
            },
          }
        );

        return {
          affectedPlants: boostedPlantDetails.length,
          effectType: "boost",
          description: `Idealni uslovi povećali jačinu ulja za ${boostedCount} biljaka`,
          affectedPlantDetails: boostedPlantDetails,
        };
      }

      // Rule 3: DRY + NONE → drought: decrease oil -0.3 and kill some plants
      if (humidityState === HumidityState.DRY && precipitationState === PrecipitationState.NONE) {
        const reducedPlantDetailsById = new Map<number, PlantEffectDetail>();
        const plantsToKill = Math.ceil(plants.length * 0.05);
        const killedPlants: number[] = [];
        const killedPlantDetails: PlantEffectDetail[] = [];

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
              reducedPlantDetailsById.set(
                plant.id,
                this.buildPlantEffectDetail(
                  plant,
                  "oil-reduced",
                  currentStrength,
                  newStrength
                )
              );
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
            killedPlantDetails.push(
              this.buildPlantEffectDetail(plants[i], "removed")
            );
          } catch (e) {
            console.error(`Failed to delete plant ${plants[i].id}:`, e);
          }
        }

        const killedPlantIds = new Set(killedPlantDetails.map((plant) => plant.id));
        const reducedPlantDetails = Array.from(reducedPlantDetailsById.values()).filter(
          (plant) => !killedPlantIds.has(plant.id)
        );
        const reducedCount = reducedPlantDetails.length;
        const affectedPlantDetails = [...killedPlantDetails, ...reducedPlantDetails];

        await this.logger.log(
          `Suša: ${killedPlantDetails.length} biljaka uginulo, ${reducedCount} izgubilo jačinu ulja`,
          LogLevel.WARNING,
          {
            userId,
            additionalData: {
              killedPlantIds: killedPlants,
              reducedPlantIds: reducedPlantDetails.map((plant) => plant.id),
              date,
            },
          }
        );

        return {
          affectedPlants: affectedPlantDetails.length,
          effectType: "drought",
          description: `Suša: ${killedPlantDetails.length} biljaka uginulo, ${reducedCount} smanjene jačine ulja`,
          affectedPlantDetails,
          details: { killedPlantIds: killedPlants, oilReduced: reducedCount },
        };
      }

      // Rule 4: MODERATE + OK → ideal conditions: duplicate 1 plant
      if (temperatureState === TemperatureState.MODERATE && humidityState === HumidityState.OK) {
        if (plants.length > 0) {
          try {
            const randomPlant = plants[Math.floor(Math.random() * plants.length)];
            const duplicatedPlant = await this.productionClient.duplicatePlant(randomPlant.id);
            const duplicatedPlantDetail = this.buildPlantEffectDetail(
              duplicatedPlant,
              "duplicated"
            );

            await this.logger.log(
              `Idealni uslovi: biljka ${randomPlant.commonName} se umnožila`,
              LogLevel.INFO,
              {
                userId,
                additionalData: {
                  duplicatedPlantId: duplicatedPlant.id,
                  sourcePlantId: randomPlant.id,
                  date,
                },
              }
            );

            return {
              affectedPlants: 1,
              effectType: "ideal",
              description: `Idealni uslovi omogućili umnožavanje biljke ${randomPlant.commonName}`,
              affectedPlantDetails: [duplicatedPlantDetail],
              details: {
                duplicatedPlantId: duplicatedPlant.id,
                duplicatedPlantName: duplicatedPlant.commonName,
                sourcePlantId: randomPlant.id,
                sourcePlantName: randomPlant.commonName,
              },
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
        affectedPlantDetails: [],
      };
    } catch (error) {
      await this.logger.log(
        `Greška pri primeni vremenskih efekata: ${(error as Error).message}`,
        LogLevel.ERROR,
        { userId, additionalData: { date } }
      );
      throw error;
    }
  }
}
