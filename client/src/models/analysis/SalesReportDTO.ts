export interface SalesReportDTO{
    id: string;
    periodType: "daily" | "weekly" | "monthly" | "yearly" | "total";
    periodValue: string;
    totalSales: number;
    totalUnitsSold: number;
    revenue: number;
    details?: {
        topProducts?: Array<{
            productId: string;
            productName: string;
            unitsSold: number;
            revenue: number;
        }>;
        averageSaleValue?: number;
        [key: string]: any;
    };
    generatedAt: string;
}

