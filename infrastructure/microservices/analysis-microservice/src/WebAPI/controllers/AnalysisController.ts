import { Router, Request, Response } from "express";
import { IAnalysisService } from "../../Domain/services/IAnalysisService";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { LogLevel } from "../../Domain/enums/LogLevel";

export class AnalysisController{
    private readonly router: Router;

    constructor(
        private readonly analysisService: IAnalysisService,
        private readonly logger: ILoggerService
    ){
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void{
        //fiskalni racuni
        this.router.post("/fiscal-bills", this.createFiscalBill.bind(this));
        this.router.get("/fiscal-bills", this.getFiscalBills.bind(this));
        this.router.get("/fiscal-bills/:id", this.getFiscalBillById.bind(this));
        this.router.get("/fiscal-bills/:id/pdf", this.exportFiscalBillPDF.bind(this));

        //analize prodaje
        this.router.post("/sales-analysis", this.generateSalesAnalysis.bind(this));
        this.router.get("/sales-analysis", this.getSalesReports.bind(this));
        this.router.get("/sales-analysis/:id/pdf", this.exportSalesReportPDF.bind(this));

        //top proizvodi
        this.router.post("/top-products", this.generateTopProducts.bind(this));
        this.router.get("/top-products", this.getTopProductsReports.bind(this));
        this.router.get("/top-products/:id/pdf", this.exportTopProductsPDF.bind(this));

        //trendovi
        this.router.post("/trend-analysis", this.generateTrendAnalysis.bind(this));
        this.router.get("/trend-analysis", this.getTrendAnalyses.bind(this));
        this.router.get("/trend-analysis/:id/pdf", this.exportTrendAnalysisPDF.bind(this));
    }

    getRouter(): Router{
        return this.router;
    }

    private getClientIp(req: Request): string {
        const forwarded = req.headers["x-forwarded-for"];
        if(typeof forwarded === "string"){
            return forwarded.split(",")[0].trim();
        }
        return req.ip || req.socket.remoteAddress || "unknown";
    }

    private async createFiscalBill(req: Request, res: Response): Promise<void>{
        const clientIp = this.getClientIp(req);

        try{
            const bill = await this.analysisService.createFiscalBill(req.body);

            await this.logger.log(
                `Kreiran fiskalni racun ${bill.id}`,
                LogLevel.INFO,
                {ipAddress: clientIp, additionalData: {billId: bill.id}}
            );
            res.status(201).json({success: true, data: bill});

        }catch(error){
            await this.logger.log(
                `Greska pri kreiranju fiskalnog racuna: ${(error as Error).message}`,
                LogLevel.ERROR,
                {ipAddress: clientIp}
            );
            res.status(500).json({success: false, message: (error as Error).message});
        }
    }

    private async getFiscalBills(req: Request, res: Response): Promise<void> {
        try{
            const period = req.query.period as string;
            const bills = await this.analysisService.getFiscalBills(period);
            res.status(200).json({success: true, data: bills});
        }catch(error){
            res.status(500).json({success: false, message: (error as Error).message});
        }
    }

    private async getFiscalBillById(req: Request, res: Response): Promise<void>{
        try{
            const bill = await this.analysisService.getFiscalBillById(req.params.id);
            res.status(200).json({success: true, data: bill});
        }catch(error){
            res.status(404).json({success: false, message: (error as Error).message});
        }
    }

    private async generateSalesAnalysis(req: Request, res: Response): Promise<void>{
        try{
            const report = await this.analysisService.generateSalesAnalysis(req.body);
            res.status(201).json({success: true, data: report});
        }catch(error){
            res.status(500).json({success: false, message: (error as Error).message});
        }
    }

    private async generateTopProducts(req: Request, res: Response): Promise<void>{
        try{
            const { period } = req.body;
            const report = await this.analysisService.generateTopProductsAnalysis(period);
            res.status(201).json({success: true, data: report});
        }catch(error){
            res.status(500).json({success: false, message: (error as Error).message});
        }
    }

    private async generateTrendAnalysis(req: Request, res: Response): Promise<void>{
        try{
            const report = await this.analysisService.generateTrendAnalysis(req.body);
            res.status(201).json({success: true, data: report});
        }catch(error){
            res.status(500).json({success: false, message: (error as Error).message});
        }
    }

    private async getSalesReports(req: Request, res: Response): Promise<void>{
        try{
            const periodType = req.query.periodType as string;
            const reports = await this.analysisService.getSalesReports(periodType);
            res.status(200).json({success: true, data: reports});
        }catch(error){
            res.status(500).json({success: false, message: (error as Error).message});
        }
    }

    private async getTopProductsReports(req: Request, res: Response): Promise<void>{
        try{
            const reports = await this.analysisService.getTopProductsReports();
            res.status(200).json({success: true, data: reports});
        }catch(error){
            res.status(500).json({success: false, message: (error as Error).message});
        }
    }

    private async getTrendAnalyses(req: Request, res: Response): Promise<void>{
        try{
            const analysisType = req.query.analysisType as string;
            const analyses = await this.analysisService.getTrendAnalyses(analysisType);
            res.status(200).json({success: true, data: analyses});
        }catch(error){
            res.status(500).json({success: false, message: (error as Error).message});
        }
    }

    private async exportFiscalBillPDF(req: Request, res: Response): Promise<void>{
        try{
            const pdfBuffer = await this.analysisService.exportFiscalBillToPDF(req.params.id);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=fiscal-bill-${req.params.id}.pdf`);
            res.send(pdfBuffer);
        }catch(error){
            res.status(500).json({success: false, message: (error as Error).message});
        }
    }

    private async exportSalesReportPDF(req: Request, res: Response): Promise<void>{
        try{
            const pdfBuffer = await this.analysisService.exportAnalysisToPDF(req.params.id, "sales");
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=sales-report-${req.params.id}.pdf`);
            res.send(pdfBuffer);
        }catch(error){
            res.status(500).json({success: false, message: (error as Error).message});
        }
    }

    private async exportTopProductsPDF(req: Request, res: Response): Promise<void>{
        try{
            const pdfBuffer = await this.analysisService.exportAnalysisToPDF(req.params.id, "top");
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=top-products-${req.params.id}.pdf`);
            res.send(pdfBuffer);
        }catch(error){
            res.status(500).json({success: false, message: (error as Error).message});
        }
    }

    private async exportTrendAnalysisPDF(req: Request, res: Response): Promise<void>{
        try{
            const pdfBuffer = await this.analysisService.exportAnalysisToPDF(req.params.id, "trend");
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=trend-analysis-${req.params.id}.pdf`);
            res.send(pdfBuffer);
        }catch(error){
            res.status(500).json({success: false, message: (error as Error).message});
        }
    }
}