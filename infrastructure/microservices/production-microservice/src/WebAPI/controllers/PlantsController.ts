import { Router, Request, Response } from "express";
import { IPlantManagementService } from "../../Services/PlantManagementService";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { CreatePlantDTO } from "../../Domain/DTOs/CreatePlantDTO";
import { UpdatePlantDTO } from "../../Domain/DTOs/UpdatePlantDTO";
import { PlantSearchCriteriaDTO } from "../../Domain/DTOs/PlantSearchCriteriaDTO";
import { PlantState } from "../../Domain/enums/PlantState";
import { LogLevel } from "../../Domain/enums/LogLevel";
import {
  validateCreatePlantData,
  validateUpdatePlantData,
} from "../validators/PlantValidator";

export class PlantsController {
  private readonly router: Router;

  constructor(
    private readonly plantManagementService: IPlantManagementService,
    private readonly logger: ILoggerService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/plants", this.getAllPlants.bind(this));
    this.router.get("/plants/search", this.searchPlants.bind(this));
    this.router.get("/plants/state/:state", this.getPlantsByState.bind(this));
    this.router.get("/plants/:id", this.getPlantById.bind(this));
    this.router.post("/plants", this.createPlant.bind(this));
    this.router.put("/plants/:id", this.updatePlant.bind(this));
    this.router.delete("/plants/:id", this.deletePlant.bind(this));
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

  private async getAllPlants(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);

    try {
      await this.logger.log("Dohvatanje svih biljaka", LogLevel.INFO, {
        ipAddress: clientIp,
      });

      const plants = await this.plantManagementService.getAllPlants();

      await this.logger.log(
        `Uspesno dohvaceno ${plants.length} biljaka`,
        LogLevel.INFO,
        { ipAddress: clientIp, additionalData: { count: plants.length } }
      );

      res.status(200).json(plants);
    } catch (error) {
      await this.logger.log(
        `Greska pri dohvatanju biljaka: ${(error as Error).message}`,
        LogLevel.ERROR,
        { ipAddress: clientIp }
      );
      res.status(500).json({ message: (error as Error).message });
    }
  }

  private async getPlantById(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);
    const id = parseInt(req.params.id, 10);

    try {
      const plant = await this.plantManagementService.getPlantById(id);
      res.status(200).json(plant);
    } catch (error) {
      await this.logger.log(
        `Biljka sa ID ${id} nije pronadjena`,
        LogLevel.WARNING,
        { ipAddress: clientIp }
      );
      res.status(404).json({ message: (error as Error).message });
    }
  }

  private async getPlantsByState(req: Request, res: Response): Promise<void> {
    const state = req.params.state as PlantState;

    if (!Object.values(PlantState).includes(state)) {
      res.status(400).json({ message: "Nevalidno stanje biljke" });
      return;
    }

    try {
      const plants = await this.plantManagementService.getPlantsByState(state);
      res.status(200).json(plants);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  private async searchPlants(req: Request, res: Response): Promise<void> {
    try {
      const criteria: PlantSearchCriteriaDTO = {
        commonName: req.query.commonName as string,
        latinName: req.query.latinName as string,
        countryOfOrigin: req.query.countryOfOrigin as string,
        state: req.query.state as PlantState,
        minOilStrength: req.query.minOilStrength
          ? parseFloat(req.query.minOilStrength as string)
          : undefined,
        maxOilStrength: req.query.maxOilStrength
          ? parseFloat(req.query.maxOilStrength as string)
          : undefined,
      };

      const plants = await this.plantManagementService.searchPlants(criteria);
      res.status(200).json(plants);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  private async createPlant(req: Request, res: Response): Promise<void> {
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

      const plant = await this.plantManagementService.createPlant(data);
      res.status(201).json({ success: true, data: plant });
    } catch (error) {
      await this.logger.log(
        `Greska pri kreiranju biljke: ${(error as Error).message}`,
        LogLevel.ERROR,
        { ipAddress: clientIp }
      );
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  private async updatePlant(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);
    const id = parseInt(req.params.id, 10);

    try {
      const data: UpdatePlantDTO = req.body;
      const validation = validateUpdatePlantData(data);

      if (!validation.success) {
        await this.logger.log(
          `Validacija nije uspela: ${validation.message}`,
          LogLevel.WARNING,
          { ipAddress: clientIp, additionalData: { plantId: id, data } }
        );
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      const plant = await this.plantManagementService.updatePlant(id, data);
      res.status(200).json({ success: true, data: plant });
    } catch (error) {
      await this.logger.log(
        `Greska pri azuriranju biljke: ${(error as Error).message}`,
        LogLevel.ERROR,
        { ipAddress: clientIp }
      );
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  private async deletePlant(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);
    const id = parseInt(req.params.id, 10);

    try {
      await this.plantManagementService.deletePlant(id);

      await this.logger.log(`Obrisana biljka sa ID ${id}`, LogLevel.INFO, {
        ipAddress: clientIp,
      });

      res.status(200).json({ success: true, message: `Biljka sa ID ${id} je obrisana` });
    } catch (error) {
      await this.logger.log(
        `Greska pri brisanju biljke: ${(error as Error).message}`,
        LogLevel.ERROR,
        { ipAddress: clientIp }
      );
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }
}