import axios, { AxiosInstance } from "axios";
import { CreateFiscalBillDTO } from "../../Domain/DTOs/CreateFiscallBillDTO";
import { PaymentMethod } from "../../Domain/enums/PaymentMethod";
import { SaleType } from "../../Domain/enums/SaleType";
import { IAnalysisClient } from "../../Domain/services/IAnalysisClient";

export class AnalysisClient implements IAnalysisClient {
    private readonly http: AxiosInstance;

    constructor(baseURL: string, gatewayKey: string) {
        this.http = axios.create({
            baseURL: baseURL,
            headers: {
                "Content-Type": "application/json",
                "X-Gateway-Key": gatewayKey
            },
            timeout: 5000
        });
    }

    private mapSaleType(type: SaleType): "retail" | "wholesale" {
        if (type === SaleType.WHOLESALE) {
            return "wholesale";
        }
        return "retail";
    }

    private mapPaymentMethod(method: PaymentMethod): "cash" | "bank_transfer" | "card" {
        switch (method) {
            case PaymentMethod.TRANSFER:
                return "bank_transfer";
            case PaymentMethod.CARD:
                return "card";
            default:
                return "cash";
        }
    }

    async createFiscalBill(data: CreateFiscalBillDTO): Promise<{ billId: number; }> {
        const payload = {
            ...data,
            saleType: this.mapSaleType(data.saleType),
            paymentMethod: this.mapPaymentMethod(data.paymentMethod),
        };

        const response = await this.http.post<{
            success?: boolean;
            data?: { id?: number };
            billId?: number;
        }>(
            "/data-analysis/fiscal-bills",
            payload
        );

        const billId = response.data?.data?.id ?? response.data?.billId ?? 0;
        return { billId };
    }
}
