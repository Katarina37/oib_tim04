import { FiscalBill } from "../models/FiscalBill";
import { SalesReport } from "../models/SalesReport";
import { TopProductReport } from "../models/TopProductReport";
import { TrendAnalysis } from "../models/TrendAnalysis";
import { CreateFiscalBillDTO } from "../DTOs/CreateFiscalBillDTO";
import { SalesAnalysisDTO } from "../DTOs/SalesAnalysisDTO";
import { TrendAnalysisDTO } from "../DTOs/TrendAnalysisDTO";

/*export interface SalesAnalysisParams{
    periodType: "daily" | "weekly" | "monthly" | "yearly" | "total";
    periodValue: string;
}

export interface TrendAnalysisParams{
    analysisType: "monthly_trend" | "product_trend";
    startDate?: Date;
    endDate?: Date;
    productId?: number;
}
*/
export interface IAnalysisService{

    // fiskalni racuni

    createFiscalBill(data: CreateFiscalBillDTO): Promise<FiscalBill>;

    getFiscalBills(period?: string): Promise<FiscalBill[]>;

    getFiscalBillById(id: number): Promise<FiscalBill>;

    // analiza prodaje

    generateSalesAnalysis(params: SalesAnalysisDTO): Promise<SalesReport>;

    getSalesReports(periodType?: SalesAnalysisDTO["periodType"]): Promise<SalesReport[]>;

    // top proizvodi

    generateTopProductsAnalysis(period: string): Promise<TopProductReport>;

    getTopProductsReports(): Promise<TopProductReport[]>;

    // trendovi

    generateTrendAnalysis(params: TrendAnalysisDTO): Promise<TrendAnalysis>;

    getTrendAnalyses(analysisType?: TrendAnalysisDTO["analysisType"]): Promise<TrendAnalysis[]>;

    // pdf izvoz

    exportAnalysisToPDF(reportId: number, reportType: "sales" | "top" | "trend"): Promise<Buffer>;

    exportFiscalBillToPDF(billId: number): Promise<Buffer>;
}

