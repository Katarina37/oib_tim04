import { Router, Request, Response } from "express";
import { IPerformanceService } from "../../Domain/services/IPerformanceService";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { LogLevel } from "../../Domain/enums/LogLevel";
import { validateRunSimulation } from "../validators/PerformanceValidator";
import { PdfService } from "../../Services/PdfService";

export class PerformanceController {
  private readonly router: Router;

  constructor(
    private readonly performanceService: IPerformanceService,
    private readonly logger: ILoggerService
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

    private initializeRoutes(): void {
        //pokrecem simulaciju
        this.router.post("/simulacija/pokreni", this.runSimulation.bind(this));
        //pregled svih izvestaja
        this.router.get("/izvestaji", this.getReports.bind(this));
        //samo jedan izvozim
        this.router.get("/izvestaji/:id/pdf", this.exportPDF.bind(this));
    }

    public getRouter(): Router {
        return this.router;
    }

    private async runSimulation(req: Request, res: Response): Promise<void> {
        //validacija ulaznih podataka
        const validation = validateRunSimulation(req.body);
        if (!validation.success) {
            res.status(400).json({ success: false, message: validation.message });
            return;
        }

        try {
            //pocetak simulacije
            await this.logger.log(`Korisnik pokrece simulaciju: ${req.body.naziv}`, LogLevel.INFO, { ipAddress: req.ip });
            
            //pozivam u servisu pocetak simulacije
            const report = await this.performanceService.runSimulation(req.body);
            
            //logujem da je uspesno
            await this.logger.log(`Simulacija uspesno izvrsena. ID: ${report.id}`, LogLevel.INFO);
            res.status(201).json({ success: true, data: report });

        } catch (error) {
            await this.logger.log(`Greska pri simulaciji: ${(error as Error).message}`, LogLevel.ERROR);
            res.status(500).json({ success: false, message: "Doslo je do greske tokom izvrsavanja simulacije." });
        }
    }

    private async getReports(_req: Request, res: Response): Promise<void> {
        try {
            const reports = await this.performanceService.getAllReports();
            res.status(200).json({ success: true, data: reports });
        } catch (error) {
            res.status(500).json({ success: false, message: "Greska pri dobavljanju izvestaja." });
        }
    }

    private async exportPDF(req: Request, res: Response): Promise<void> {
        const idParam = req.params.id;
        if (typeof idParam !== 'string') {
            res.status(400).json({ success: false, message: "Nevalidan ID parametar." });
            return;
        }
        const id = parseInt(idParam);

        if (isNaN(id)) {
            res.status(400).json({ success: false, message: "Validan ID je obavezan." });
            return;
        }
        try {
            //dobavljam podatke iz baze preko servisa
            const report = await this.performanceService.getReportById(id);
            if (!report) {
                res.status(404).json({ success: false, message: "Izvestaj nije pronadjen." });
                return;
            }

            //generisem pdf preko PdfServisa
            const pdfBuffer = await PdfService.generatePerformancePdf(report);

            //logujem izvoz pdfa
            await this.logger.log(`Izvezen PDF za izvestaj ID: ${id}`, LogLevel.INFO, { ipAddress: req.ip });

            //klijentu saljem fajl
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=izvestaj-performansi-${id}.pdf`);
            res.send(pdfBuffer);

        } catch (error) {
            await this.logger.log(`Greska pri generisanju PDF-a: ${(error as Error).message}`, LogLevel.ERROR);
            res.status(500).json({ success: false, message: "Greska prilikom generisanja PDF dokumenta." });
        }
    }
}
