import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("trend_analyses")
export class TrendAnalysis {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({name: "tip_analize", length: 50})
    analysisType!: "monthly_trend" | "product_trend" | "category_trend";

    @Column({name: "podaci", type: "json"})
    dataPoints!: Array<{
        label: string;
        value: number;
        date?: string;
        productId?: number;
    }>;

    @Column({name: "zakljucak", type: "text",nullable: true})
    conclusion?: string;

    @Column({name: "generisan_datum"})
    generatedAt!: Date;
}
