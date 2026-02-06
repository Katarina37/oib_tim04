import { Router, Request, Response } from "express";
import { ISaleService } from "../../Domain/services/ISaleService";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { LogType } from "../../Domain/enums/LogType";
import { CreateSaleDto } from "../../Domain/DTOs/CreateSaleDTO";
import { validateCreateSale } from "../validators/SaleValidator";
import { UserContext } from "../../Domain/types/UserContext";

export class SalesController {
  private readonly router: Router;

  constructor(
    private readonly salesService: ISaleService,
    private readonly logger: ILoggerService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get("/", this.getAllSales.bind(this));
    this.router.get("/perfumes/available", this.getAvailablePerfumes.bind(this));
    this.router.get("/:id", this.getSaleById.bind(this));
    this.router.get("/bill/:billNumber", this.getSaleByBillNumber.bind(this));
    this.router.post("/", this.createSale.bind(this));
    this.router.delete("/:id", this.deleteSale.bind(this));
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    return typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.ip || "unknown";
  }

  private getUserContext(req: Request): UserContext | null {
    const roleHeader = req.headers["x-user-role"];
    const userIdHeader = req.headers["x-user-id"];

    const role = Array.isArray(roleHeader) ? roleHeader[0] : roleHeader;
    const userIdRaw = Array.isArray(userIdHeader) ? userIdHeader[0] : userIdHeader;

    if (!role || !userIdRaw) {
      return null;
    }

    const userId = Number(userIdRaw);
    if (!Number.isFinite(userId) || userId <= 0) {
      return null;
    }

    return { id: userId, role: role.toString() };
  }

  private async createSale(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);
    const userContext = this.getUserContext(req);

    if (!userContext) {
      res.status(401).json({ success: false, message: "User context missing" });
      return;
    }

    const data: CreateSaleDto = {
      ...req.body,
      userId: userContext.id,
    };

    try {
      // 1. Logovanje početka
      await this.logger.log("Primljen zahtev za kreiranje prodaje", LogType.INFO, {
        ipAddress: clientIp,
        userId: data.userId
      });

      // 2. Validacija
      const validation = validateCreateSale(data);
      if (!validation.success) {
        await this.logger.log(`Validacija neuspešna: ${validation.message}`, LogType.WARNING, {
          ipAddress: clientIp,
          additionalData: { error: validation.message }
        });
        res.status(400).json({ success: false, message: validation.message });
        return;
      }

      // 3. Izvršavanje prodaje
        const sale = await this.salesService.executeSale(data, userContext);

      // 4. Logovanje uspeha
      await this.logger.log(`Prodaja uspešno kreirana. Račun: ${sale.billNumber}`, LogType.INFO, {
        ipAddress: clientIp,
        userId: data.userId,
        additionalData: { billNumber: sale.billNumber, total: sale.totalAmount }
      });

      res.status(201).json({ success: true, data: sale });
    } catch (err) {
      // 5. Logovanje greške
      await this.logger.log(`Greška pri kreiranju prodaje: ${(err as Error).message}`, LogType.ERROR, {
        ipAddress: clientIp
      });
      res.status(400).json({ success: false, message: (err as Error).message });
    }
  }

  private async getAllSales(req: Request, res: Response): Promise<void> {
    try {
      const sales = await this.salesService.getAllSales();
      res.status(200).json(sales);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  private async getSaleById(req: Request, res: Response): Promise<void> {
    const idParam = req.params.id;
    if (typeof idParam !== 'string') {
        res.status(400).json({ error: "Invalid ID" });
        return;
    }

    const id = parseInt(idParam, 10);
    try {
      const sale = await this.salesService.getSaleById(id);
      res.status(200).json(sale);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
  }

  private async getSaleByBillNumber(req: Request, res: Response): Promise<void> {
    const billNumber = req.params.billNumber;
    if (typeof billNumber !== 'string') {
        res.status(400).json({ error: "Invalid bill number" });
        return;
    }
    
    try {
      const sale = await this.salesService.getSaleByBillNumber(billNumber);
      res.status(200).json(sale);
    } catch (err) {
      res.status(404).json({ message: (err as Error).message });
    }
}

  private async deleteSale(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);
    const idParam = req.params.id;

    if (typeof idParam !== 'string') {
      res.status(400).json({ success: false, message: "Invalid ID format" });
      return;
    }

    const id = parseInt(idParam, 10);

    try {
      await this.salesService.deleteSale(id);
      await this.logger.log(`Obrisan račun sa ID: ${id}`, LogType.INFO, { ipAddress: clientIp });
      res.status(200).json({ success: true, message: "Sale deleted successfully" });
    } catch (err) {
      res.status(404).json({ success: false, message: (err as Error).message });
    }
  }

  private async getAvailablePerfumes(req: Request, res: Response): Promise<void> {
    try {
      const userContext = this.getUserContext(req) ?? undefined;
      const perfumes = await this.salesService.getAvailablePerfumes(userContext);
      res.status(200).json(perfumes);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}
