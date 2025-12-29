import { IAnalysisAPI } from "./IAnalysisAPI";
import { IHttpClient } from "../http/IHttpClient";
import { FiscalBillDTO } from "../../models/analysis/FiscalBillDTO";
import { SalesReportDTO } from "../../models/analysis/SalesReportDTO";
import { TopProductReportDTO } from "../../models/analysis/TopProductReportDTO";
import { TrendAnalysisDTO } from "../../models/analysis/TrendAnalysisDTO";
import { CreateFiscalBillDTO } from "../../models/analysis/CreateFiscalBillDTO";
import { SalesAnalysisParams } from "../../models/analysis/SalesAnalysisParams";
import { TrendAnalysisParams } from "../../models/analysis/TrendAnalysisParams";
import { TopProductsParams } from "../../models/analysis/TopProductsParams";

export class AnalysisAPI implements IAnalysisAPI{
    constructor(private readonly httpClient: IHttpClient){}
    private readonly basePath = "/analysis";
    private readonly baseURL = import.meta.env.VITE_GATEWAY_URL;
    private getAuthHeaders(token: string){
        return {
            Authorization: `Bearer ${token}`,
            "X-Gateway-Key": "OIBTIM4"
        };
    }

    private unwrapResponse<T>(data: unknown): T{
        if(data && typeof data == "object" && "data" in data){
            return (data as {data: T}).data;
        }
        return data as T;
    }

    //fiskalni racuni
    async createFiscalBill(data: CreateFiscalBillDTO, token: string): Promise<FiscalBillDTO> {
        const response = await this.httpClient.post<FiscalBillDTO>(
            `${this.basePath}/fiscal-bills`,
            data,
            {headers: this.getAuthHeaders(token)}
        );
        return this.unwrapResponse<FiscalBillDTO>(response);
    }

    async getFiscalBills(token: string, period?: string): Promise<FiscalBillDTO[]> {
        const params = period ? {period} : {};
        const response = await this.httpClient.get<FiscalBillDTO[]>(
            `${this.basePath}/fiscal-bills`,
            {
                headers: this.getAuthHeaders(token),
                params
            }
        );
        return this.unwrapResponse<FiscalBillDTO[]>(response);
    }

    async getFiscalBillById(id: string, token: string): Promise<FiscalBillDTO> {
        const response = await this.httpClient.get<FiscalBillDTO>(
            `${this.basePath}/fiscal-bills/${id}`,
            {headers: this.getAuthHeaders(token)}
        );
        return this.unwrapResponse<FiscalBillDTO>(response);
    }

    async exportFiscalBillPDF(id: string, token: string): Promise<Blob> {
        const response = await fetch(`${this.baseURL}${this.basePath}/fiscal-bills/${id}/pdf`, {
            headers: {
                ...this.getAuthHeaders(token),
                Accept: "application/pdf"
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to export PDF: ${response.statusText}`);
        }
        return await response.blob();
    }

    //analiza prodaje
    async generateSalesAnalysis(params: SalesAnalysisParams, token: string): Promise<SalesReportDTO> {
        const response = await this.httpClient.post<SalesReportDTO>(
            `${this.basePath}/sales-analysis`,
            params,
            {headers: this.getAuthHeaders(token)}
        );
        return this.unwrapResponse<SalesReportDTO>(response);
    }

    async getSalesReports(token: string, periodType?: string): Promise<SalesReportDTO[]> {
        const params = periodType? {periodType} : {};
        const response = await this.httpClient.get<SalesReportDTO[]>(
            `${this.basePath}/sales-analysis`,
            {
                headers: this.getAuthHeaders(token),
                params
            }
        );
        return this.unwrapResponse<SalesReportDTO[]>(response);
    }

    async exportSalesReportPDF(id: string, token: string): Promise<Blob> {
        const response = await fetch(`${this.baseURL}${this.basePath}/sales-analysis/${id}/pdf`, {
            headers: {
                ...this.getAuthHeaders(token),
                Accept: "application/pdf"
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to export PDF: ${response.statusText}`);
        }
        
        return await response.blob();
    }

    //top proizvodi
    async generateTopProductsAnalysis(params: TopProductsParams, token: string): Promise<TopProductReportDTO> {
        const response = await this.httpClient.post<TopProductReportDTO>(
            `${this.basePath}/top-products`,
            params,
            {headers: this.getAuthHeaders(token)}
        );
        return this.unwrapResponse<TopProductReportDTO>(response);
    }

    async getTopProductsReports(token: string): Promise<TopProductReportDTO[]> {
        const response = await this.httpClient.post<TopProductReportDTO[]>(
            `${this.basePath}/top-products`,
            {headers: this.getAuthHeaders(token)}
        );
        return this.unwrapResponse<TopProductReportDTO[]>(response);
    }

    async exportTopProductsPDF(id: string, token: string): Promise<Blob> {
        const response = await fetch(`${this.baseURL}${this.basePath}/top-products/${id}/pdf`, {
            headers: {
                ...this.getAuthHeaders(token),
                Accept: "application/pdf"
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to export PDF: ${response.statusText}`);
        }
        
        return await response.blob();
    }

    //trendovi
    async generateTrendAnalysis(params: TrendAnalysisParams, token: string): Promise<TrendAnalysisDTO> {
        const response = await this.httpClient.post<TrendAnalysisDTO>(
            `${this.basePath}/trend-analysis`,
            params,
            {headers: this.getAuthHeaders(token)}
        );
        return this.unwrapResponse<TrendAnalysisDTO>(response);
    }

    async getTrendAnalyses(token: string, analysisType?: string): Promise<TrendAnalysisDTO[]> {
        const params = analysisType ? {analysisType} : {};
        const response = await this.httpClient.post<TrendAnalysisDTO[]>(
            `${this.basePath}/trend-analysis`,
            {headers: this.getAuthHeaders(token),
            params
            }
        );
        return this.unwrapResponse<TrendAnalysisDTO[]>(response);
    }

    async exportTrendAnalysisPDF(id: string, token: string): Promise<Blob> {
        const response = await fetch(`${this.baseURL}${this.basePath}/trend-analysis/${id}/pdf`, {
            headers: {
                ...this.getAuthHeaders(token),
                Accept: "application/pdf"
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to export PDF: ${response.statusText}`);
        }
        
        return await response.blob();
    }


}