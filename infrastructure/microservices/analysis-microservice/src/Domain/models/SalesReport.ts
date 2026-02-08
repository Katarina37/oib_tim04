export class SalesReport {
    id!: number;

    periodType!: "daily" | "weekly" | "monthly" | "yearly" | "total";

    periodValue!: string;

    totalSales!: number;

    totalUnitsSold!: number;

    revenue!: number;

    details?: Record<string, any>;

    generatedAt!: Date;
}
