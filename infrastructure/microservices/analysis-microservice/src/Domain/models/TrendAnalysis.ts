import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("trend_analyses")
export class TrendAnalysis {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({name: "tip_analize", length: 50})
    analysisType!: "monthly_trend" | "product_trend" | "category_trend";

    @Column({name: "podaci", type: "json"})
    dataPoints!: Array<{
        label: string;
        value: number;
        date?: string;
        productId?: string;
    }>;

    @Column({name: "zakljucak", type: "text",nullable: true})
    conclusion?: string;

    @Column({name: "generisan_datum"})
    generatedAt!: Date;
}
