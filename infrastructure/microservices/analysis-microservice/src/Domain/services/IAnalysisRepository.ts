import { FiscalBill } from "../models/FiscalBill";
import { SalesReport } from "../models/SalesReport";
import { TopProductReport } from "../models/TopProductReport";
import { TrendAnalysis } from "../models/TrendAnalysis";

export interface IAnalysisRepository{

    // filter racuna
    findFiscalBillsByPeriod(period: string): Promise<FiscalBill[]>;
    
    findFiscalBillsByDateRange(startDate: Date, endDate: Date): Promise<FiscalBill[]>;
    
    findFiscalBillById(id: string): Promise<FiscalBill | null>;
    
    createFiscalBill(data: Partial<FiscalBill>): Promise<FiscalBill>;

    // izvjestaji

    findSalesReportByPeriod(periodType: string, periodValue: string): Promise<SalesReport | null>;
    
    createSalesReport(data: Partial<SalesReport>): Promise<SalesReport>;

    // top proizvodi

    findTopProductReportByPeriod(period: string): Promise<TopProductReport | null>;

    createTopProductReport(data: Partial<TopProductReport>): Promise<TopProductReport>;

    // trendovi

    createTrendAnalysis(data: Partial<TrendAnalysis>): Promise<TrendAnalysis>;

    findTrendAnalysisByType(analysisType: string): Promise<TrendAnalysis[]>;

    //agregacije za analizu

    getTotalSales(period: string): Promise<{
        totalSales: number;
        totalRevenue: number;
    }>;

    getTopProducts(period: string, limit: number): Promise<Array<{
        productId: string;
        productName: string;
        unitsSold: number;
        revenue: number;
    }>>;

    getSalesTrend(startDate: Date, endDate: Date): Promise<Array<{
        date: string;
        sales: number;
        revenue: number;
    }>>;
}
