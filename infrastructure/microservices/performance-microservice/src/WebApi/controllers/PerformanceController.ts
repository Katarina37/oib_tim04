import { Router, Request, Response } from "express";
import { IPerformanceApplicationService } from "../../Application/services/IPerformanceApplicationService";
import { NotFoundError } from "../../Domain/errors/NotFoundError";
import { ValidationError } from "../../Domain/errors/ValidationError";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { LogLevel } from "../../Domain/enums/LogLevel";
import { mapReportToResponse } from "../mappers/PerformanceApiMapper";
import { validateIdParam, validateRunSimulationPayload } from "../validators/PerformanceValidator";

export class PerformanceController {
  private readonly router: Router;

  constructor(
    private readonly performanceApplicationService: IPerformanceApplicationService,
    private readonly logger: ILoggerService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    const prefix = "/performance-analysis";
    // Canonical routes
    this.router.post(`${prefix}/simulations`, this.runSimulation.bind(this));
    this.router.get(`${prefix}/reports`, this.getReports.bind(this));
    this.router.get(`${prefix}/reports/:id`, this.getReportById.bind(this));
    this.router.get(`${prefix}/reports/:id/pdf`, this.exportPDF.bind(this));

    // Legacy compatibility routes
    this.router.post(`${prefix}/simulacija/pokreni`, this.runSimulation.bind(this));
    this.router.get(`${prefix}/izvestaji`, this.getReports.bind(this));
    this.router.get(`${prefix}/izvestaji/:id`, this.getReportById.bind(this));
    this.router.get(`${prefix}/izvestaji/:id/pdf`, this.exportPDF.bind(this));
  }

  public getRouter(): Router {
    return this.router;
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string") {
      return forwarded.split(",")[0].trim();
    }

    return req.ip || req.socket.remoteAddress || "unknown";
  }

  private getUserId(req: Request): number | undefined {
    const headerValue = req.headers["x-user-id"];
    const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;
    if (!value) {
      return undefined;
    }

    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  private getParamValue(value: string | string[] | undefined): string | undefined {
    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
  }

  private resolveStatusCode(error: unknown): number {
    if (error instanceof NotFoundError) {
      return 404;
    }

    if (error instanceof ValidationError) {
      return 400;
    }

    return 500;
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return "Doslo je do neocekivane greske.";
  }

  private async runSimulation(req: Request, res: Response): Promise<void> {
    const validation = validateRunSimulationPayload(req.body);
    const clientIp = this.getClientIp(req);
    const userId = this.getUserId(req);

    if (!validation.success) {
      await this.logger.log(
        `Neuspesna validacija zahteva za simulaciju: ${validation.message}`,
        LogLevel.WARNING,
        {
          userId,
          ipAddress: clientIp,
        }
      );
      res.status(400).json({ success: false, message: validation.message });
      return;
    }

    try {
      await this.logger.log(
        `Pokrenuta simulacija: ${validation.data.naziv}`,
        LogLevel.INFO,
        {
          userId,
          ipAddress: clientIp,
          additionalData: {
            tipAlgoritma: validation.data.tip_algoritma,
            brojZahteva: validation.data.broj_zahteva,
          },
        }
      );

      const report = await this.performanceApplicationService.runSimulation(validation.data);

      await this.logger.log(
        `Simulacija zavrsena, kreiran izvestaj ${report.id}`,
        LogLevel.INFO,
        {
          userId,
          ipAddress: clientIp,
          additionalData: {
            reportId: report.id,
            efikasnost: report.efikasnostProcenat,
            brzinaObrade: report.brzinaObrade,
          },
        }
      );

      res.status(201).json({ success: true, data: mapReportToResponse(report) });
    } catch (error) {
      await this.logger.log(
        `Greska pri pokretanju simulacije: ${this.resolveErrorMessage(error)}`,
        LogLevel.ERROR,
        {
          userId,
          ipAddress: clientIp,
        }
      );

      res.status(this.resolveStatusCode(error)).json({
        success: false,
        message: this.resolveErrorMessage(error),
      });
    }
  }

  private async getReports(req: Request, res: Response): Promise<void> {
    const clientIp = this.getClientIp(req);
    const userId = this.getUserId(req);

    try {
      const reports = await this.performanceApplicationService.getReports();
      res.status(200).json({
        success: true,
        data: reports.map((report) => mapReportToResponse(report)),
      });

      await this.logger.log("Uspesno preuzeta istorija performance izvestaja", LogLevel.INFO, {
        userId,
        ipAddress: clientIp,
        additionalData: {
          count: reports.length,
        },
      });
    } catch (error) {
      await this.logger.log(
        `Greska pri preuzimanju izvestaja: ${this.resolveErrorMessage(error)}`,
        LogLevel.ERROR,
        {
          userId,
          ipAddress: clientIp,
        }
      );

      res.status(this.resolveStatusCode(error)).json({
        success: false,
        message: this.resolveErrorMessage(error),
      });
    }
  }

  private async getReportById(req: Request, res: Response): Promise<void> {
    const idValidation = validateIdParam(this.getParamValue(req.params.id));
    if (!idValidation.success) {
      res.status(400).json({ success: false, message: idValidation.message });
      return;
    }

    try {
      const report = await this.performanceApplicationService.getReportById(idValidation.data);
      res.status(200).json({
        success: true,
        data: mapReportToResponse(report),
      });
    } catch (error) {
      res.status(this.resolveStatusCode(error)).json({
        success: false,
        message: this.resolveErrorMessage(error),
      });
    }
  }

  private async exportPDF(req: Request, res: Response): Promise<void> {
    const idValidation = validateIdParam(this.getParamValue(req.params.id));
    const clientIp = this.getClientIp(req);
    const userId = this.getUserId(req);

    if (!idValidation.success) {
      res.status(400).json({ success: false, message: idValidation.message });
      return;
    }

    try {
      const { report, pdfBuffer } = await this.performanceApplicationService.exportReportPdf(
        idValidation.data
      );

      const filename = `performance-report-${report.id}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.status(200).send(pdfBuffer);

      await this.logger.log(`PDF izvezen za izvestaj ${report.id}`, LogLevel.INFO, {
        userId,
        ipAddress: clientIp,
      });
    } catch (error) {
      await this.logger.log(
        `Greska pri izvozu PDF-a: ${this.resolveErrorMessage(error)}`,
        LogLevel.ERROR,
        {
          userId,
          ipAddress: clientIp,
          additionalData: {
            reportId: idValidation.data,
          },
        }
      );

      res.status(this.resolveStatusCode(error)).json({
        success: false,
        message: this.resolveErrorMessage(error),
      });
    }
  }
}
