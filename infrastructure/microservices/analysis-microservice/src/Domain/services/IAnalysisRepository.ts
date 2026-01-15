import { FiscalBill } from "../models/FiscalBill";
import { SalesReport } from "../models/SalesReport";
import { TopProductReport } from "../models/TopProductReport";
import { TrendAnalysis } from "../models/TrendAnalysis";
import { SalesAnalysisDTO } from "../DTOs/SalesAnalysisDTO";
import { TrendAnalysisDTO } from "../DTOs/TrendAnalysisDTO";

export interface IAnalysisRepository{

    // filter racuna
    findFiscalBillsByPeriod(period: string): Promise<FiscalBill[]>;
    
    findFiscalBillsByDateRange(startDate: Date, endDate: Date): Promise<FiscalBill[]>;
    
    findFiscalBillById(id: number): Promise<FiscalBill | null>;
    
    createFiscalBill(data: Partial<FiscalBill>): Promise<FiscalBill>;

    // izvjestaji

    findSalesReportByPeriod(periodType: SalesAnalysisDTO["periodType"], periodValue: string): Promise<SalesReport | null>;
    
    createSalesReport(data: Partial<SalesReport>): Promise<SalesReport>;

    findAllSalesReports(periodType?: SalesAnalysisDTO["periodType"]): Promise<SalesReport[]>;

    // top proizvodi

    findTopProductReportByPeriod(period: string): Promise<TopProductReport | null>;

    createTopProductReport(data: Partial<TopProductReport>): Promise<TopProductReport>;

    findAllTopProductsReports(): Promise<TopProductReport[]>;

    // trendovi

    createTrendAnalysis(data: Partial<TrendAnalysis>): Promise<TrendAnalysis>;

    findTrendAnalysisByType(analysisType: TrendAnalysisDTO["analysisType"]): Promise<TrendAnalysis[]>;

    //agregacije za analizu

    getTotalSales(period: string): Promise<{
        totalSales: number;
        totalRevenue: number;
    }>;

    getTopProducts(period: string, limit: number): Promise<Array<{
        productId: number;
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
