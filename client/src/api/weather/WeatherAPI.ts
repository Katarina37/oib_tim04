import { IHttpClient } from "../http/IHttpClient";
import { IWeatherAPI } from "./IWeatherAPI";
import { WeatherDTO, CreateWeatherDTO, WeatherEffectResultDTO } from "../../models/weather/WeatherDTO";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export class WeatherAPI implements IWeatherAPI {
  private readonly basePath = "/weather";

  constructor(private readonly httpClient: IHttpClient) {}

  private getHeaders(token: string): { headers: Record<string, string> } {
    const demoDate = localStorage.getItem("demoDate");
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (demoDate) {
      headers["X-Demo-Date"] = demoDate;
    }
    return { headers };
  }

  async getAllWeather(token: string): Promise<WeatherDTO[]> {
    return this.httpClient.get<WeatherDTO[]>(this.basePath, this.getHeaders(token));
  }

  async getWeatherByMonth(yearMonth: string, token: string): Promise<WeatherDTO[]> {
    return this.httpClient.get<WeatherDTO[]>(
      `${this.basePath}/month/${yearMonth}`,
      this.getHeaders(token)
    );
  }

  async getWeatherByDate(date: string, token: string): Promise<WeatherDTO> {
    return this.httpClient.get<WeatherDTO>(
      `${this.basePath}/${date}`,
      this.getHeaders(token)
    );
  }

  async saveWeather(data: CreateWeatherDTO, token: string): Promise<WeatherDTO> {
    const response = await this.httpClient.post<ApiResponse<WeatherDTO>>(
      this.basePath,
      data,
      this.getHeaders(token)
    );
    return response.data;
  }

  async applyWeatherEffects(date: string, token: string): Promise<WeatherEffectResultDTO> {
    const response = await this.httpClient.post<ApiResponse<WeatherEffectResultDTO>>(
      `${this.basePath}/${date}/apply-effects`,
      {},
      this.getHeaders(token)
    );
    return response.data;
  }

  async deleteWeather(date: string, token: string): Promise<void> {
    await this.httpClient.delete(`${this.basePath}/${date}`, this.getHeaders(token));
  }
}
