import { Repository, Between } from "typeorm";
import { AppDataSource } from "../Database/DbConnectionPool";
import { FiscalBill } from "../Domain/models/FiscalBill";
import { SalesReport } from "../Domain/models/SalesReport";
import { TopProductReport } from "../Domain/models/TopProductReport";
import { TrendAnalysis } from "../Domain/models/TrendAnalysis";
import { IAnalysisRepository } from "../Domain/services/IAnalysisRepository";
import { end } from "pdfkit";

export class AnalysisRepository implements IAnalysisRepository{
    private fiscalBillRepo: Repository<FiscalBill>;
    private salesReportRepo: Repository<SalesReport>;
    private topProductRepo: Repository<TopProductReport>;
    private trendAnalysisRepo: Repository<TrendAnalysis>;

    constructor(){
        this.fiscalBillRepo = AppDataSource.getRepository(FiscalBill);
        this.salesReportRepo = AppDataSource.getRepository(SalesReport);
        this.topProductRepo = AppDataSource.getRepository(TopProductReport);
        this.trendAnalysisRepo = AppDataSource.getRepository(TrendAnalysis);
    }

    async findFiscalBillsByPeriod(period: string): Promise<FiscalBill[]> {
        const [year, month] = period.split('-');
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

        return this.fiscalBillRepo.find({
            where: {
                createdAt: Between(startDate, endDate)
            },
            order: { createdAt: "DESC"}
        });
    }

    async findFiscalBillsByDateRange(startDate: Date, endDate: Date): Promise<FiscalBill[]> {
        return this.fiscalBillRepo.find({
            where: {createdAt: Between(startDate, endDate)},
            order: {createdAt: "DESC"}
        });
    }

    async findFiscalBillById(id: string): Promise<FiscalBill | null> {
        return this.fiscalBillRepo.findOneBy({id});
    }

    async createFiscalBill(data: Partial<FiscalBill>): Promise<FiscalBill> {
        const bill = this.fiscalBillRepo.create(data);
        return this.fiscalBillRepo.save(bill);
    }

    async findSalesReportByPeriod(periodType: string, periodValue: string): Promise<SalesReport | null> {
        return this.salesReportRepo.findOneBy({periodType, periodValue});
    }

    async createSalesReport(data: Partial<SalesReport>): Promise<SalesReport> {
        const report = this.salesReportRepo.create(data);
        return this.salesReportRepo.save(report);
    }

    async findTopProductReportByPeriod(period: string): Promise<TopProductReport | null> {
        return this.topProductRepo.findOneBy({period});
    }

    async createTopProductReport(data: Partial<TopProductReport>): Promise<TopProductReport> {
        const report = this.topProductRepo.create(data);
        return this.topProductRepo.save(report);
    }

    async createTrendAnalysis(data: Partial<TrendAnalysis>): Promise<TrendAnalysis> {
        const analysis = this.trendAnalysisRepo.create(data);
        return this.trendAnalysisRepo.save(analysis);
    }

    async findTrendAnalysisByType(analysisType: string): Promise<TrendAnalysis[]> {
        return this.trendAnalysisRepo.find({
            where: {analysisType},
            order: {generatedAt: "DESC"}
        });
    }

    async getTotalSales(period: string): Promise<{ totalSales: number; totalRevenue: number; }> {
        const bills = await this.findFiscalBillsByPeriod(period);
        const totalRevenue = bills.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
        const totalSales = bills.reduce((sum, bill) => sum + bill.soldItems.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

        return{
            totalSales,
            totalRevenue
        };
    }

    async getTopProducts(period: string, limit: number): Promise<Array<{ productId: string; productName: string; unitsSold: number; revenue: number; }>> {
        const bills = await this.findFiscalBillsByPeriod(period);
        const productMap = new Map<string, {productName: string; unitsSold: number; revenue: number}>();

        bills.forEach(bill => {
            bill.soldItems.forEach(item => {
                const existing = productMap.get(item.productId) || {
                    productName: item.productName,
                    unitsSold: 0,
                    revenue: 0
                };

                existing.unitsSold += item.quantity;
                existing.revenue += item.price * item.quantity;
                productMap.set(item.productId, existing);
            });
        });

        const products = Array.from(productMap.entries()).map(([productId, data]) => ({
            productId,
            ...data
        }));

        return products.sort((a, b) => b.unitsSold - a.unitsSold).slice(0, limit);
    }

    async getSalesTrend(startDate: Date, endDate: Date): Promise<Array<{ date: string; sales: number; revenue: number; }>> {
        const bills = await this.findFiscalBillsByDateRange(startDate, endDate);
        const dailyMap = new Map<string, {sales: number; revenue: number}>();

        bills.forEach(bill => {
            const date = bill.createdAt.toISOString().split('T')[0];
            const existing = dailyMap.get(date) || { sales: 0, revenue: 0};

            const billSales = bill.soldItems.reduce((sum, item) => sum + item.quantity, 0);
            existing.sales += billSales;
            existing.revenue += Number(bill.totalAmount);
            
            dailyMap.set(date, existing);
        });

         const result: Array<{ date: string; sales: number; revenue: number }> = [];
         const current = new Date(startDate);
    
        while (current <= endDate) {
        const date = current.toISOString().split('T')[0];
        const dailyData = dailyMap.get(date) || { sales: 0, revenue: 0 };
        
        result.push({
            date,
            sales: dailyData.sales,
            revenue: dailyData.revenue
        });
        
        current.setDate(current.getDate() + 1);
        }
    
        return result; 
    }
}