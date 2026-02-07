import { IAnalysisService } from "../Domain/services/IAnalysisService";
import { CreateFiscalBillDTO } from "../Domain/DTOs/CreateFiscalBillDTO";
import { SalesAnalysisDTO } from "../Domain/DTOs/SalesAnalysisDTO";
import { TrendAnalysisDTO } from "../Domain/DTOs/TrendAnalysisDTO";
import { IAnalysisRepository } from "../Domain/services/IAnalysisRepository";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { FiscalBill} from "../Domain/models/FiscalBill";
import { SalesReport } from "../Domain/models/SalesReport";
import { TopProductReport } from "../Domain/models/TopProductReport";
import { TrendAnalysis } from "../Domain/models/TrendAnalysis";
import { LogLevel } from "../Domain/enums/LogLevel";
import PDFDocument from "pdfkit";

export class AnalysisService implements IAnalysisService{
    constructor(
        private readonly analysisRepository: IAnalysisRepository,
        private readonly logger: ILoggerService
    ){}

    async createFiscalBill(data: CreateFiscalBillDTO): Promise<FiscalBill> {
        try{
            const totalAmount = data.soldItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const bill = await this.analysisRepository.createFiscalBill({
                saleType: data.saleType,
                paymentMethod: data.paymentMethod,
                soldItems: data.soldItems,
                totalAmount,
                userId: data.userId
            });

            await this.logger.log(
                `Kreiran fiskalni racun ${bill.id}`, LogLevel.INFO,
                { additionalData: {billId: bill.id, totalAmount}}
            );
            return bill;
        }catch(error){
            await this.logger.log(
                `Greska pri kreiranju fiskalnog racuna: ${(error as Error).message}`,
                LogLevel.ERROR,
                {additionalData: {billData: data}}
            );
            throw error;
        }
    }

    async getFiscalBills(period?: string): Promise<FiscalBill[]> {
        try{
            if(period && period !== "all"){
                return await this.analysisRepository.findFiscalBillsByPeriod(period);
            }

            const endDate = new Date();
            const startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 1);
            return await this.analysisRepository.findFiscalBillsByDateRange(startDate, endDate);

        }catch(error){
            await this.logger.log(
                `Greska pri dobavljanju fiskalnih racuna: ${(error as Error).message}`,
                LogLevel.ERROR
            );
            throw error;
        }
    }

    async getFiscalBillById(id: number): Promise<FiscalBill> {
        const bill = await this.analysisRepository.findFiscalBillById(id);
        if(!bill){
            throw new Error(`Fiskalni racun sa ID ${id} nije pronadjen`);
        }
        return bill;
    }

    async generateSalesAnalysis(params: SalesAnalysisDTO): Promise<SalesReport> {
        try{
            const existing = await this.analysisRepository.findSalesReportByPeriod(params.periodType, params.periodValue);

            if(existing){
                await this.logger.log(
                    `Koristi se postojeci izvestaj prodaje za period ${params.periodValue}`,
                    LogLevel.INFO
                );
                return existing;
            }

            const period = params.periodValue;
            const {totalSales, totalRevenue} = await this.analysisRepository.getTotalSales(period);

            const topProducts = await this.analysisRepository.getTopProducts(period, 5);
            const totalUnitsSold = topProducts.reduce((sum, p) => sum + p.unitsSold, 0);

            const report = await this.analysisRepository.createSalesReport({
                periodType: params.periodType,
                periodValue: params.periodValue,
                totalSales: totalRevenue,
                totalUnitsSold,
                revenue: totalRevenue,
                details: {
                    topProducts,
                    averageSaleValue: totalUnitsSold > 0 ? totalRevenue / totalUnitsSold : 0
                },
                generatedAt: new Date()
            });

            await this.logger.log(
                `Generisan izvestaj prodaje za period ${params.periodValue}`,
                LogLevel.INFO,
                {additionalData: {reportId: report.id, totalRevenue}}
            );
            return report;
        }catch(error){
            await this.logger.log(
                `Greska pri generisanju izvestaja prodaje: ${(error as Error).message}`,
                LogLevel.ERROR,
                {additionalData: {params}}
            );
            throw error;
        }
    }

    async generateTopProductsAnalysis(period: string): Promise<TopProductReport> {
        try{
            const existing = await this.analysisRepository.findTopProductReportByPeriod(period);

            if(existing){
                return existing;
            }

            const topProducts = await this.analysisRepository.getTopProducts(period, 10);
            const totalRevenueFromTop = topProducts.reduce((sum, p) => sum + p.revenue, 0);

            if(!topProducts || topProducts.length === 0 || totalRevenueFromTop === 0){
                return await this.analysisRepository.createTopProductReport({
                    period,
                    topProducts: [],
                    totalRevenueFromTop: 0,
                    generatedAt: new Date()
                });
            }

            const productsWithPercentage = topProducts.map((product, index) => ({
                ...product,
                percentage: (product.revenue / totalRevenueFromTop) * 100
            }));

            const report = await this.analysisRepository.createTopProductReport({
                period, 
                topProducts: productsWithPercentage,
                totalRevenueFromTop,
                generatedAt: new Date()
            });

            await this.logger.log(
                `Generisan izvestaj top 10 proizvoda za period ${period}`,
                LogLevel.INFO,
                {additionalData: {reportId: report.id}}
            );
            return report;
        }catch(error){
            await this.logger.log(
                `Greska pri generisanju izvestaja top proizvoda: ${(error as Error).message}`,
                LogLevel.ERROR,
                {additionalData: {period}}
            );
            throw error;
        }
    }

    async generateTrendAnalysis(params: TrendAnalysisDTO): Promise<TrendAnalysis> {
        try{
            const endDate = params.endDate || new Date();
            const startDate = params.startDate || new Date(endDate.getFullYear(), endDate.getMonth() - 6, 1);

            const salesTrend = await this.analysisRepository.getSalesTrend(startDate, endDate);

            if(!salesTrend || salesTrend.length === 0){
                return await this.analysisRepository.createTrendAnalysis({
                    analysisType: params.analysisType,
                    dataPoints: [],
                    conclusion: "Nema dovoljno podataka za analizu",
                    generatedAt: new Date()
                });
            }

            const report = await this.analysisRepository.createTrendAnalysis({
                analysisType: params.analysisType,
                dataPoints: salesTrend.map(point => ({
                    label: point.date,
                    value: point.sales,
                    date: point.date
                })),
                conclusion: this.generateConclusion(salesTrend),
                generatedAt: new Date()
            });

            await this.logger.log(
                `Generisana analiza trenda ${params.analysisType}`,
                LogLevel.INFO,
                {additionalData: {reportId: report.id, dataPoints: salesTrend.length}}
            );
            return report;
        }catch(error){
            await this.logger.log(
                `Greska pri generisanju analize trenda: ${(error as Error).message}`,
                LogLevel.ERROR,
                {additionalData: {params}}
            );
            throw error;
        }
    }

    async getSalesReports(periodType?: SalesAnalysisDTO["periodType"]): Promise<SalesReport[]> {
        return await this.analysisRepository.findAllSalesReports(periodType);
    }

    async getTopProductsReports(): Promise<TopProductReport[]> {
       return await this.analysisRepository.findAllTopProductsReports();
    }

    async getTrendAnalyses(analysisType?: TrendAnalysisDTO["analysisType"]): Promise<TrendAnalysis[]> {
    if (analysisType) {
      return await this.analysisRepository.findTrendAnalysisByType(analysisType);
    }
    return [];
  }

  async exportAnalysisToPDF(reportId: number, reportType: "sales" | "top" | "trend"): Promise<Buffer> {
      return new Promise((resolve, reject) => {
        try{
            const doc = new PDFDocument();
            const chunks: Buffer[] = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            //zaglavlje

            doc.fontSize(20).text(`Izvestaj - ${reportType.toUpperCase()}`, {align: 'center'});
            doc.moveDown();
            doc.fontSize(12).text(`Report ID: ${reportId}`);
            doc.text(`Datum generisanja: ${new Date().toLocaleDateString('sr-RS')}`);
            doc.moveDown();

            //sadrzaj

            doc.fontSize(14).text('Podaci izvestaja:');
            doc.fontSize(10).text('Ovaj izvestaj je generisan automatski od strane sistema za analizu podataka.');
            doc.moveDown();
            doc.text('Parfimerija O\'Sinjel De Or');
            doc.text('Paris, Francuska');

            doc.end();
        }catch(error){
            reject(error);
        }
      });
  }

  async exportFiscalBillToPDF(billId: number): Promise<Buffer> {
      const bill = await this.getFiscalBillById(billId);

      return new Promise((resolve, reject) => {
        try{
            const doc = new PDFDocument();
            const chunks: Buffer[] = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));

            // dizajn fiskalnog racuna

            doc.fontSize(18).text('FISKALNI RACUN', {align: 'center'});
            doc.moveDown(0.5);
            doc.fontSize(10).text(`Broj: ${bill.id}`);
            doc.text(`Datum: ${bill.createdAt.toLocaleDateString('sr-RS')}`);
            doc.moveDown();

            doc.fontSize(12).text('Stavke:', {underline: true});
            doc.moveDown(0.5);

            bill.soldItems.forEach((item, index) => {
                doc.fontSize(10).text(
                    `${index+1}. ${item.productName} x${item.quantity} - ${(item.price * item.quantity).toFixed(2)} RSD`
                );
            });

            doc.moveDown();
            doc.fontSize(12).text(`Ukupan iznos: ${bill.totalAmount.toFixed(2)} RSD`, {align: 'right'});
            doc.moveDown();
            doc.text(`Nacin placanja: ${bill.paymentMethod}`);
            doc.text(`Tip prodaje: ${bill.saleType}`);

            doc.end();
        }catch(error){
            reject(error);
        }
     });
   }

    private generateConclusion(trendData: Array<{ date: string, sales: number}>): string {
        if(trendData.length < 2) return "Nedovoljno podataka za analizu trenda";

        const first = trendData[0].sales;
        const last = trendData[trendData.length - 1].sales;
        const change = ((last - first) / first) * 100;

        if(change > 10) return "Rastuci trend prodaje";
        if(change < -10) return "Opadajuci trend prodaje";

        return "Stabilan trend prodaje";
    }
}
