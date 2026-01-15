import { FiscalBillDTO } from "../../models/analysis/FiscalBillDTO";
import { SalesReportDTO } from "../../models/analysis/SalesReportDTO";
import { TopProductReportDTO } from "../../models/analysis/TopProductReportDTO";
import { TrendAnalysisDTO } from "../../models/analysis/TrendAnalysisDTO";
import { CreateFiscalBillDTO } from "../../models/analysis/CreateFiscalBillDTO";
import { SalesAnalysisParams } from "../../models/analysis/SalesAnalysisParams";
import { TopProductsParams } from "../../models/analysis/TopProductsParams";
import { TrendAnalysisParams } from "../../models/analysis/TrendAnalysisParams";

export interface IAnalysisAPI{
    //fiskalni racuni
    createFiscalBill(data: CreateFiscalBillDTO, token: string): Promise<FiscalBillDTO>;
    getFiscalBills(token: string, period?: string): Promise<FiscalBillDTO[]>;
    getFiscalBillById(id: number, token: string): Promise<FiscalBillDTO>;
    exportFiscalBillPDF(id: number, token: string): Promise<Blob>;

    //analiza prodaje
    generateSalesAnalysis(params: SalesAnalysisParams, token: string): Promise<SalesReportDTO>;
    getSalesReports(token: string, periodType?: string):Promise<SalesReportDTO[]>;
    exportSalesReportPDF(id: number, token: string): Promise<Blob>;

    //top proizvodi
    generateTopProductsAnalysis(params: TopProductsParams, token: string): Promise<TopProductReportDTO>;
    getTopProductsReports(token: string): Promise<TopProductReportDTO[]>;
    exportTopProductsPDF(id: number, token: string): Promise<Blob>;

    //trendovi
    generateTrendAnalysis(params: TrendAnalysisParams, token: string): Promise<TrendAnalysisDTO>;
    getTrendAnalyses(token: string, analysisType?: string): Promise<TrendAnalysisDTO[]>;
    exportTrendAnalysisPDF(id: number, token: string): Promise<Blob>;
}
