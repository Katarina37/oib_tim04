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

    findSalesReportById(id: number): Promise<SalesReport | null>;
    
    createSalesReport(data: Partial<SalesReport>): Promise<SalesReport>;

    findAllSalesReports(periodType?: SalesAnalysisDTO["periodType"]): Promise<SalesReport[]>;

    // top proizvodi

    findTopProductReportByPeriod(period: string): Promise<TopProductReport | null>;

    findTopProductReportById(id: number): Promise<TopProductReport | null>;

    createTopProductReport(data: Partial<TopProductReport>): Promise<TopProductReport>;

    findAllTopProductsReports(): Promise<TopProductReport[]>;

    // trendovi

    createTrendAnalysis(data: Partial<TrendAnalysis>): Promise<TrendAnalysis>;

    findTrendAnalysisById(id: number): Promise<TrendAnalysis | null>;

    findTrendAnalysisByType(analysisType: TrendAnalysisDTO["analysisType"]): Promise<TrendAnalysis[]>;

    findAllTrendAnalyses(): Promise<TrendAnalysis[]>;

    //agregacije za analizu

    getTotalSalesByDateRange(startDate: Date, endDate: Date): Promise<{
        totalSales: number;
        totalRevenue: number;
    }>;

    getTopProductsByDateRange(startDate: Date, endDate: Date, limit: number): Promise<Array<{
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
