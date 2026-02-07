import { Repository, Between } from "typeorm";
import { AppDataSource } from "../Database/DbConnectionPool";
import { FiscalBill } from "../Domain/models/FiscalBill";
import { SalesReport } from "../Domain/models/SalesReport";
import { TopProductReport } from "../Domain/models/TopProductReport";
import { TrendAnalysis } from "../Domain/models/TrendAnalysis";
import { IAnalysisRepository } from "../Domain/services/IAnalysisRepository";
import { SalesAnalysisDTO } from "../Domain/DTOs/SalesAnalysisDTO";
import { TrendAnalysisDTO } from "../Domain/DTOs/TrendAnalysisDTO";
import { FiscalBillEntity } from "../Infrastructure/entities/FiscalBillEntity";

export class AnalysisRepository implements IAnalysisRepository{
    private fiscalBillRepo: Repository<FiscalBillEntity>;
    private salesReportRepo: Repository<SalesReport>;
    private topProductRepo: Repository<TopProductReport>;
    private trendAnalysisRepo: Repository<TrendAnalysis>;

    constructor(){
        this.fiscalBillRepo = AppDataSource.getRepository(FiscalBillEntity);
        this.salesReportRepo = AppDataSource.getRepository(SalesReport);
        this.topProductRepo = AppDataSource.getRepository(TopProductReport);
        this.trendAnalysisRepo = AppDataSource.getRepository(TrendAnalysis);
    }

    async findFiscalBillsByPeriod(period: string): Promise<FiscalBill[]> {
        const { startDate, endDate } = this.resolvePeriodRange(period);

        const bills = await this.fiscalBillRepo.find({
            where: {
                createdAt: Between(startDate, endDate)
            },
            order: { createdAt: "DESC" }
        });

        return bills.map((bill) => this.toDomainFiscalBill(bill));
    }

    async findFiscalBillsByDateRange(startDate: Date, endDate: Date): Promise<FiscalBill[]> {
        const bills = await this.fiscalBillRepo.find({
            where: {createdAt: Between(startDate, endDate)},
            order: {createdAt: "DESC"}
        });
        return bills.map((bill) => this.toDomainFiscalBill(bill));
    }

    async findFiscalBillById(id: number): Promise<FiscalBill | null> {
        const bill = await this.fiscalBillRepo.findOneBy({id});
        return bill ? this.toDomainFiscalBill(bill) : null;
    }

    async createFiscalBill(data: Partial<FiscalBill>): Promise<FiscalBill> {
        const bill = this.fiscalBillRepo.create(this.toEntityFiscalBill(data));
        const saved = await this.fiscalBillRepo.save(bill);
        return this.toDomainFiscalBill(saved);
    }

    async findSalesReportByPeriod(periodType: SalesAnalysisDTO["periodType"], periodValue: string): Promise<SalesReport | null> {
        return this.salesReportRepo.findOneBy({periodType, periodValue});
    }

    async createSalesReport(data: Partial<SalesReport>): Promise<SalesReport> {
        const report = this.salesReportRepo.create(data);
        return this.salesReportRepo.save(report);
    }

    async findAllSalesReports(periodType?: SalesAnalysisDTO["periodType"]): Promise<SalesReport[]> {
        if(periodType){
            return this.salesReportRepo.find({
                where: {periodType},
                order: {generatedAt: "DESC"}
            });
        }

        return this.salesReportRepo.find({
            order: {generatedAt: "DESC"}
        });
    }

    async findTopProductReportByPeriod(period: string): Promise<TopProductReport | null> {
        return this.topProductRepo.findOneBy({period});
    }

    async createTopProductReport(data: Partial<TopProductReport>): Promise<TopProductReport> {
        const report = this.topProductRepo.create(data);
        return this.topProductRepo.save(report);
    }

    async findAllTopProductsReports(): Promise<TopProductReport[]> {
        return this.topProductRepo.find({
            order: {generatedAt: "DESC"}
        });
    }

    async createTrendAnalysis(data: Partial<TrendAnalysis>): Promise<TrendAnalysis> {
        const analysis = this.trendAnalysisRepo.create(data);
        return this.trendAnalysisRepo.save(analysis);
    }

    async findTrendAnalysisByType(analysisType: TrendAnalysisDTO["analysisType"]): Promise<TrendAnalysis[]> {
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

    async getTopProducts(period: string, limit: number): Promise<Array<{ productId: number; productName: string; unitsSold: number; revenue: number; }>> {
        const bills = await this.findFiscalBillsByPeriod(period);
        const productMap = new Map<number, {productName: string; unitsSold: number; revenue: number}>();

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

    private resolvePeriodRange(period: string): { startDate: Date; endDate: Date } {
        const now = new Date();

        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        switch (period) {
            case "today":
                return { startDate: todayStart, endDate: todayEnd };

            case "yesterday": {
                const startDate = new Date(todayStart);
                startDate.setDate(startDate.getDate() - 1);

                const endDate = new Date(todayEnd);
                endDate.setDate(endDate.getDate() - 1);

                return { startDate, endDate };
            }

            case "this-week": {
                const day = now.getDay();
                const diffToMonday = day === 0 ? -6 : 1 - day;

                const startDate = new Date(now);
                startDate.setDate(now.getDate() + diffToMonday);
                startDate.setHours(0, 0, 0, 0);

                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
                endDate.setHours(23, 59, 59, 999);

                return { startDate, endDate };
            }

            case "this-month": {
                const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
                const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                return { startDate, endDate };
            }

            case "last-month": {
                const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
                const endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                return { startDate, endDate };
            }

            case "this-year": {
                const startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
                const endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                return { startDate, endDate };
            }

            case "all":
                return {
                    startDate: new Date(2000, 0, 1, 0, 0, 0, 0),
                    endDate: new Date(2100, 11, 31, 23, 59, 59, 999)
                };

            default:
                break;
        }

        if (/^\d{4}-\d{2}$/.test(period)) {
            const [yearRaw, monthRaw] = period.split("-");
            const year = Number(yearRaw);
            const month = Number(monthRaw);

            if (month >= 1 && month <= 12) {
                const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
                const endDate = new Date(year, month, 0, 23, 59, 59, 999);
                return { startDate, endDate };
            }
        }

        return { startDate: todayStart, endDate: todayEnd };
    }

    private toDomainFiscalBill(entity: FiscalBillEntity): FiscalBill {
        return {
            id: entity.id,
            billNumber: undefined,
            saleType: entity.saleType,
            paymentMethod: entity.paymentMethod,
            soldItems: entity.soldItems,
            totalAmount: Number(entity.totalAmount),
            createdAt: entity.createdAt,
            userId: entity.userId,
        };
    }

    private toEntityFiscalBill(data: Partial<FiscalBill>): Partial<FiscalBillEntity> {
        return {
            id: data.id,
            saleType: data.saleType,
            paymentMethod: data.paymentMethod,
            soldItems: data.soldItems,
            totalAmount: data.totalAmount,
            createdAt: data.createdAt,
            userId: data.userId,
        };
    }
}
