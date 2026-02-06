import { Router, Request, Response } from "express";
import { IWeatherService } from "../../Domain/services/IWeatherService";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { CreateWeatherDTO } from "../../Domain/DTOs/CreateWeatherDTO";
import { LogLevel } from "../../Domain/enums/LogLevel";
import {
  validateCreateWeatherData,
  validateDateParam,
  validateMonthParam,
} from "../validators/WeatherValidator";
import { InvalidDemoDateError } from "../../Domain/errors/InvalidDemoDateError";
import { WeatherEffectDateNotAllowedError } from "../../Domain/errors/WeatherEffectDateNotAllowedError";

export class WeatherController {
  private readonly router: Router;

  constructor(
    private readonly weatherService: IWeatherService,
    private readonly logger: ILoggerService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/weather", this.getAllWeather.bind(this));
    this.router.get("/weather/month/:yearMonth", this.getWeatherByMonth.bind(this));
    this.router.get("/weather/:date", this.getWeatherByDate.bind(this));
    this.router.post("/weather", this.saveWeather.bind(this));
    this.router.post("/weather/:date/apply-effects", this.applyWeatherEffects.bind(this));
    this.router.delete("/weather/:date", this.deleteWeather.bind(this));
  }

  getRouter(): Router {
    return this.router;
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    }
    return req.ip || req.socket.remoteAddress || "unknown";
  }

  private getParamValue(param: string | string[] | undefined): string {
    if (Array.isArray(param)) {
      return param[0] ?? "";
    }
    return param ?? "";
  }

  private getHeaderValue(header: string | string[] | undefined): string {
    if (Array.isArray(header)) {
      return header[0] ?? "";
    }
    return header ?? "";
  }

  private getUserId(req: Request): number | undefined {
    const headerValue = req.headers["x-user-id"];
    const rawValue = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    const parsedValue = rawValue ? Number.parseInt(String(rawValue), 10) : NaN;

    if (!Number.isNaN(parsedValue)) {
      return parsedValue;
    }

    return (req as Request & { user?: { id: number } }).user?.id;
  }

  private async getAllWeather(_req: Request, res: Response): Promise<void> {
    try {
      const weather = await this.weatherService.getAllWeather();
      res.status(200).json(weather);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  private async getWeatherByMonth(req: Request, res: Response): Promise<void> {
    const yearMonth = this.getParamValue(req.params.yearMonth);
    const validation = validateMonthParam(yearMonth);

    if (!validation.success) {
      res.status(400).json({ success: false, message: validation.message });
      return;
    }

    try {
      const weather = await this.weatherService.getWeatherByMonth(yearMonth);
      res.status(200).json(weather);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  private async getWeatherByDate(req: Request, res: Response): Promise<void> {
    const date = this.getParamValue(req.params.date);
    const validation = validateDateParam(date);

    if (!validation.success) {
      res.status(400).json({ success: false, message: validation.message });
      return;
    }

    try {
      const weather = await this.weatherService.getWeatherByDate(date);
      res.status(200).json(weather);
    } catch (error) {
      res.status(404).json({ message: (error as Error).message });
    }
  }

  private async saveWeather(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);
    const userId = this.getUserId(req);

    try {
      const data: CreateWeatherDTO = req.body;
      const validation = validateCreateWeatherData(data);

      if (!validation.success) {
        await this.logger.log(
          `Validacija nije uspela: ${validation.message}`,
          LogLevel.WARNING,
          { userId, ipAddress: clientIp, additionalData: { data } }
        );
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const weather = await this.weatherService.saveWeather(data, userId);
      res.status(201).json({ success: true, data: weather });
    } catch (error) {
      await this.logger.log(
        `Greška pri čuvanju vremenskih podataka: ${(error as Error).message}`,
        LogLevel.ERROR,
        { userId, ipAddress: clientIp }
      );
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  private async applyWeatherEffects(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);
    const date = this.getParamValue(req.params.date);
    const userId = this.getUserId(req);
    const demoDateHeader = this.getHeaderValue(req.headers["x-demo-date"]);
    const demoDate = demoDateHeader ? demoDateHeader.trim() : undefined;

    const validation = validateDateParam(date);
    if (!validation.success) {
      res.status(400).json({ success: false, message: validation.message });
      return;
    }

    try {
      const result = await this.weatherService.applyWeatherEffects(date, userId, demoDate);

      await this.logger.log(
        `Primenjeni vremenski efekti za ${date}: ${result.description}`,
        LogLevel.INFO,
        { userId, ipAddress: clientIp, additionalData: { date, result } }
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      if (
        error instanceof WeatherEffectDateNotAllowedError ||
        error instanceof InvalidDemoDateError
      ) {
        await this.logger.log(
          `Neuspešna primena vremenskih efekata: ${(error as Error).message}`,
          LogLevel.WARNING,
          { userId, ipAddress: clientIp, additionalData: { date, demoDate } }
        );
        res.status(400).json({ success: false, message: (error as Error).message });
        return;
      }

      await this.logger.log(
        `Greška pri primeni vremenskih efekata: ${(error as Error).message}`,
        LogLevel.ERROR,
        { userId, ipAddress: clientIp, additionalData: { date } }
      );
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  private async deleteWeather(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);
    const date = this.getParamValue(req.params.date);
    const userId = this.getUserId(req);

    const validation = validateDateParam(date);
    if (!validation.success) {
      res.status(400).json({ success: false, message: validation.message });
      return;
    }

    try {
      await this.weatherService.deleteWeather(date, userId);

      await this.logger.log(
        `Obrisani vremenski podaci za ${date}`,
        LogLevel.INFO,
        { userId, ipAddress: clientIp }
      );

      res.status(200).json({ success: true, message: `Vremenski podaci za ${date} su obrisani` });
    } catch (error) {
      await this.logger.log(
        `Greška pri brisanju vremenskih podataka: ${(error as Error).message}`,
        LogLevel.ERROR,
        { userId, ipAddress: clientIp }
      );
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }
}
