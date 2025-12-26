import { FiscalBill } from "../models/FiscalBill";
import { SalesReport } from "../models/SalesReport";
import { TopProductReport } from "../models/TopProductReport";
import { TrendAnalysis } from "../models/TrendAnalysis";
import { CreateFiscalBillDTO } from "../DTOs/CreateFiscalBillDTO";

export interface SalesAnalysisParams{
    periodType: "daily" | "weekly" | "monthly" | "yearly" | "total";
    periodValue: string;
}

export interface TrendAnalysisParams{
    analysisType: "monthly_trend" | "product_trend";
    startDate?: Date;
    endDate?: Date;
    productId?: string;
}

export interface IAnalysisService{

    // fiskalni racuni

    createFiscalBill(data: CreateFiscalBillDTO): Promise<FiscalBill>;

    getFiscalBills(period?: string): Promise<FiscalBill[]>;

    getFiscalBillById(id: string): Promise<FiscalBill>;

    // analiza prodaje

    generateSalesAnalysis(params: SalesAnalysisParams): Promise<SalesReport>;

    getSalesReports(periodType?: string): Promise<SalesReport[]>;

    // top proizvodi

    generateTopProductsAnalysis(period: string): Promise<TopProductReport>;

    getTopProductsReports(): Promise<TopProductReport[]>;

    // trendovi

    generateTrendAnalysis(params: TrendAnalysisParams): Promise<TrendAnalysis>;

    getTrendAnalyses(analysisType?: string): Promise<TrendAnalysis[]>;

    // pdf izvoz

    exportAnalysisToPDF(reportId: string, reportType: "sales" | "top" | "trend"): Promise<Buffer>;

    exportFiscalBillToPDF(billId: string): Promise<Buffer>;
}

