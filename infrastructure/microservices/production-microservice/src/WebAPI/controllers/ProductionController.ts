import { Router, Request, Response } from "express";
import { IProductionService } from "../../Domain/services/IProductionService";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { CreatePlantDTO } from "../../Domain/DTOs/CreatePlantDTO";
import { HarvestPlantsDTO } from "../../Domain/DTOs/HarvestPlantsDTO";
import { ChangeOilStrengthDTO } from "../../Domain/DTOs/ChangeOilStrengthDTO";
import { LogLevel } from "../../Domain/enums/LogLevel";
import {
  validateCreatePlantData,
  validateChangeOilStrengthData,
  validateHarvestPlantsData,
} from "../validators/PlantValidator";

export class ProductionController {
  private readonly router: Router;

  constructor(
    private readonly productionService: IProductionService,
    private readonly logger: ILoggerService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post("/production/plant", this.plantNewPlant.bind(this));
    this.router.put("/production/oil-strength", this.changeOilStrength.bind(this));
    this.router.post("/production/harvest", this.harvestPlants.bind(this));
    this.router.get("/production/available", this.getAvailablePlants.bind(this));
    this.router.get("/production/plant/:id", this.getPlantById.bind(this));
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

  private async plantNewPlant(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);

    try {
      const data: CreatePlantDTO = req.body;
      const validation = validateCreatePlantData(data);

      if (!validation.success) {
        await this.logger.log(
          `Validacija nije uspela: ${validation.message}`,
          LogLevel.WARNING,
          { ipAddress: clientIp, additionalData: { data } }
        );
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const plant = await this.productionService.plantNewPlant(data);

      res.status(201).json({ success: true, data: plant });
    } catch (error) {
      await this.logger.log(
        `Greska pri sadjenju biljke: ${(error as Error).message}`,
        LogLevel.ERROR,
        { ipAddress: clientIp }
      );
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  private async changeOilStrength(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);

    try {
      const data: ChangeOilStrengthDTO = req.body;
      const validation = validateChangeOilStrengthData(data);

      if (!validation.success) {
        await this.logger.log(
          `Validacija nije uspela: ${validation.message}`,
          LogLevel.WARNING,
          { ipAddress: clientIp, additionalData: { data } }
        );
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const plant = await this.productionService.changeOilStrength(
        data.plantId,
        data.percentageChange
      );

      res.status(200).json({ success: true, data: plant });
    } catch (error) {
      await this.logger.log(
        `Greska pri promeni jacine ulja: ${(error as Error).message}`,
        LogLevel.ERROR,
        { ipAddress: clientIp }
      );
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  private async harvestPlants(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);

    try {
      const data: HarvestPlantsDTO = req.body;
      const validation = validateHarvestPlantsData(data);

      if (!validation.success) {
        await this.logger.log(
          `Validacija nije uspela: ${validation.message}`,
          LogLevel.WARNING,
          { ipAddress: clientIp, additionalData: { data } }
        );
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const harvestedPlants = await this.productionService.harvestPlants(data);

      res.status(200).json({ success: true, data: harvestedPlants });
    } catch (error) {
      await this.logger.log(
        `Greska pri branju biljaka: ${(error as Error).message}`,
        LogLevel.ERROR,
        { ipAddress: clientIp }
      );
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  private async getAvailablePlants(_req: Request, res: Response): Promise<void> {
    try {
      const plants = await this.productionService.getAvailablePlants();
      res.status(200).json(plants);
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  private async getPlantById(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);
    const id = parseInt(req.params.id, 10);

    try {
      const plant = await this.productionService.getPlantById(id);
      res.status(200).json(plant);
    } catch (error) {
      await this.logger.log(
        `Biljka sa ID ${id} nije pronadjena`,
        LogLevel.WARNING,
        { ipAddress: clientIp }
      );
      res.status(404).json({ success: false, message: (error as Error).message });
    }
  }
}