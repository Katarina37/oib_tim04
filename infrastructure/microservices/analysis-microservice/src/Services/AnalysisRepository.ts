import { Between, Repository } from "typeorm";
import { AppDataSource } from "../Database/DbConnectionPool";
import { FiscalBill } from "../Domain/models/FiscalBill";
import { SalesReport } from "../Domain/models/SalesReport";
import { TopProductReport } from "../Domain/models/TopProductReport";
import { TrendAnalysis } from "../Domain/models/TrendAnalysis";
import { IAnalysisRepository } from "../Domain/services/IAnalysisRepository";
import { SalesAnalysisDTO } from "../Domain/DTOs/SalesAnalysisDTO";
import { TrendAnalysisDTO } from "../Domain/DTOs/TrendAnalysisDTO";
import { FiscalBillEntity } from "../Infrastructure/entities/FiscalBillEntity";
import { SalesReportEntity } from "../Infrastructure/entities/SalesReportEntity";
import { TopProductReportEntity } from "../Infrastructure/entities/TopProductReportEntity";
import { TrendAnalysisEntity } from "../Infrastructure/entities/TrendAnalysisEntity";

type TopProductItem = {
  productId: number;
  productName: string;
  unitsSold: number;
  revenue: number;
  percentage: number;
};

export class AnalysisRepository implements IAnalysisRepository {
  private fiscalBillRepo: Repository<FiscalBillEntity>;
  private salesReportRepo: Repository<SalesReportEntity>;
  private topProductRepo: Repository<TopProductReportEntity>;
  private trendAnalysisRepo: Repository<TrendAnalysisEntity>;

  constructor() {
    this.fiscalBillRepo = AppDataSource.getRepository(FiscalBillEntity);
    this.salesReportRepo = AppDataSource.getRepository(SalesReportEntity);
    this.topProductRepo = AppDataSource.getRepository(TopProductReportEntity);
    this.trendAnalysisRepo = AppDataSource.getRepository(TrendAnalysisEntity);
  }

  async findFiscalBillsByPeriod(period: string): Promise<FiscalBill[]> {
    const { startDate, endDate } = this.resolvePeriodRange(period);
    return this.findFiscalBillsByDateRange(startDate, endDate);
  }

  async findFiscalBillsByDateRange(startDate: Date, endDate: Date): Promise<FiscalBill[]> {
    const bills = await this.fiscalBillRepo.find({
      where: { createdAt: Between(startDate, endDate) },
      order: { createdAt: "DESC" },
    });
    return bills.map((bill) => this.toDomainFiscalBill(bill));
  }

  async findFiscalBillById(id: number): Promise<FiscalBill | null> {
    const bill = await this.fiscalBillRepo.findOneBy({ id });
    return bill ? this.toDomainFiscalBill(bill) : null;
  }

  async createFiscalBill(data: Partial<FiscalBill>): Promise<FiscalBill> {
    const bill = this.fiscalBillRepo.create(this.toEntityFiscalBill(data));
    const saved = await this.fiscalBillRepo.save(bill);
    return this.toDomainFiscalBill(saved);
  }

  async findSalesReportByPeriod(
    periodType: SalesAnalysisDTO["periodType"],
    periodValue: string
  ): Promise<SalesReport | null> {
    const report = await this.salesReportRepo.findOneBy({ periodType, periodValue });
    return report ? this.toDomainSalesReport(report) : null;
  }

  async findSalesReportById(id: number): Promise<SalesReport | null> {
    const report = await this.salesReportRepo.findOneBy({ id });
    return report ? this.toDomainSalesReport(report) : null;
  }

  async createSalesReport(data: Partial<SalesReport>): Promise<SalesReport> {
    const report = this.salesReportRepo.create(this.toEntitySalesReport(data));
    const saved = await this.salesReportRepo.save(report);
    return this.toDomainSalesReport(saved);
  }

  async findAllSalesReports(periodType?: SalesAnalysisDTO["periodType"]): Promise<SalesReport[]> {
    const reports = periodType
      ? await this.salesReportRepo.find({
          where: { periodType },
          order: { generatedAt: "DESC" },
        })
      : await this.salesReportRepo.find({
          order: { generatedAt: "DESC" },
        });

    return reports.map((report) => this.toDomainSalesReport(report));
  }

  async findTopProductReportByPeriod(period: string): Promise<TopProductReport | null> {
    const report = await this.topProductRepo.findOneBy({ period });
    return report ? this.toDomainTopProductReport(report) : null;
  }

  async findTopProductReportById(id: number): Promise<TopProductReport | null> {
    const report = await this.topProductRepo.findOneBy({ id });
    return report ? this.toDomainTopProductReport(report) : null;
  }

  async createTopProductReport(data: Partial<TopProductReport>): Promise<TopProductReport> {
    const report = this.topProductRepo.create(this.toEntityTopProductReport(data));
    const saved = await this.topProductRepo.save(report);
    return this.toDomainTopProductReport(saved);
  }

  async findAllTopProductsReports(): Promise<TopProductReport[]> {
    const reports = await this.topProductRepo.find({
      order: { generatedAt: "DESC" },
    });
    return reports.map((report) => this.toDomainTopProductReport(report));
  }

  async createTrendAnalysis(data: Partial<TrendAnalysis>): Promise<TrendAnalysis> {
    const analysis = this.trendAnalysisRepo.create(this.toEntityTrendAnalysis(data));
    const saved = await this.trendAnalysisRepo.save(analysis);
    return this.toDomainTrendAnalysis(saved);
  }

  async findTrendAnalysisById(id: number): Promise<TrendAnalysis | null> {
    const analysis = await this.trendAnalysisRepo.findOneBy({ id });
    return analysis ? this.toDomainTrendAnalysis(analysis) : null;
  }

  async findTrendAnalysisByType(
    analysisType: TrendAnalysisDTO["analysisType"]
  ): Promise<TrendAnalysis[]> {
    const analyses = await this.trendAnalysisRepo.find({
      where: { analysisType },
      order: { generatedAt: "DESC" },
    });
    return analyses.map((analysis) => this.toDomainTrendAnalysis(analysis));
  }

  async findAllTrendAnalyses(): Promise<TrendAnalysis[]> {
    const analyses = await this.trendAnalysisRepo.find({
      order: { generatedAt: "DESC" },
    });
    return analyses.map((analysis) => this.toDomainTrendAnalysis(analysis));
  }

  async getTotalSalesByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<{ totalSales: number; totalRevenue: number }> {
    const bills = await this.findFiscalBillsByDateRange(startDate, endDate);
    const totalRevenue = bills.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
    const totalSales = bills.reduce(
      (sum, bill) =>
        sum + bill.soldItems.reduce((itemSum, item) => itemSum + Number(item.quantity), 0),
      0
    );

    return {
      totalSales,
      totalRevenue,
    };
  }

  async getTopProductsByDateRange(
    startDate: Date,
    endDate: Date,
    limit: number
  ): Promise<
    Array<{
      productId: number;
      productName: string;
      unitsSold: number;
      revenue: number;
    }>
  > {
    const bills = await this.findFiscalBillsByDateRange(startDate, endDate);
    const productMap = new Map<number, { productName: string; unitsSold: number; revenue: number }>();

    for (const bill of bills) {
      for (const item of bill.soldItems) {
        const existing = productMap.get(item.productId) ?? {
          productName: item.productName,
          unitsSold: 0,
          revenue: 0,
        };

        existing.unitsSold += Number(item.quantity);
        existing.revenue += Number(item.price) * Number(item.quantity);
        productMap.set(item.productId, existing);
      }
    }

    const products = Array.from(productMap.entries()).map(([productId, data]) => ({
      productId,
      ...data,
    }));

    return products.sort((a, b) => b.unitsSold - a.unitsSold).slice(0, Math.max(1, limit));
  }

  async getSalesTrend(
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ date: string; sales: number; revenue: number }>> {
    const bills = await this.findFiscalBillsByDateRange(startDate, endDate);
    const dailyMap = new Map<string, { sales: number; revenue: number }>();

    for (const bill of bills) {
      const dateKey = this.formatDateKey(bill.createdAt);
      const existing = dailyMap.get(dateKey) ?? { sales: 0, revenue: 0 };
      const billSales = bill.soldItems.reduce((sum, item) => sum + Number(item.quantity), 0);

      existing.sales += billSales;
      existing.revenue += Number(bill.totalAmount);
      dailyMap.set(dateKey, existing);
    }

    const result: Array<{ date: string; sales: number; revenue: number }> = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    const last = new Date(endDate);
    last.setHours(23, 59, 59, 999);

    while (current <= last) {
      const dateKey = this.formatDateKey(current);
      const dailyData = dailyMap.get(dateKey) ?? { sales: 0, revenue: 0 };

      result.push({
        date: dateKey,
        sales: dailyData.sales,
        revenue: dailyData.revenue,
      });

      current.setDate(current.getDate() + 1);
    }

    return result;
  }

  private resolvePeriodRange(period: string): { startDate: Date; endDate: Date } {
    const now = new Date();
    const todayStart = this.toDayStart(now);
    const todayEnd = this.toDayEnd(now);

    const normalized = (period ?? "").trim().toLowerCase();
    switch (normalized) {
      case "":
      case "today":
        return { startDate: todayStart, endDate: todayEnd };

      case "yesterday": {
        const day = new Date(todayStart);
        day.setDate(day.getDate() - 1);
        return { startDate: this.toDayStart(day), endDate: this.toDayEnd(day) };
      }

      case "this-week": {
        const { startDate, endDate } = this.resolveWeekRangeForDate(now);
        return { startDate, endDate };
      }

      case "last-week": {
        const anchor = new Date(now);
        anchor.setDate(anchor.getDate() - 7);
        const { startDate, endDate } = this.resolveWeekRangeForDate(anchor);
        return { startDate, endDate };
      }

      case "this-month":
        return this.resolveMonthRange(now.getFullYear(), now.getMonth() + 1);

      case "last-month": {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return this.resolveMonthRange(monthDate.getFullYear(), monthDate.getMonth() + 1);
      }

      case "this-year":
        return this.resolveYearRange(now.getFullYear());

      case "last-year":
        return this.resolveYearRange(now.getFullYear() - 1);

      case "all":
        return {
          startDate: new Date(2000, 0, 1, 0, 0, 0, 0),
          endDate: new Date(2100, 11, 31, 23, 59, 59, 999),
        };
      default:
        break;
    }

    if (/^\d{4}$/.test(normalized)) {
      const year = Number(normalized);
      return this.resolveYearRange(year);
    }

    if (/^\d{4}-\d{2}$/.test(normalized)) {
      const [yearRaw, monthRaw] = normalized.split("-");
      const year = Number(yearRaw);
      const month = Number(monthRaw);
      if (month >= 1 && month <= 12) {
        return this.resolveMonthRange(year, month);
      }
    }

    if (/^\d{4}-w\d{2}$/i.test(normalized)) {
      const [yearRaw, weekRaw] = normalized.split("-w");
      const year = Number(yearRaw);
      const week = Number(weekRaw);
      if (week >= 1 && week <= 53) {
        return this.resolveIsoWeekRange(year, week);
      }
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      const parsed = new Date(normalized);
      if (!Number.isNaN(parsed.getTime())) {
        return { startDate: this.toDayStart(parsed), endDate: this.toDayEnd(parsed) };
      }
    }

    return { startDate: todayStart, endDate: todayEnd };
  }

  private resolveWeekRangeForDate(date: Date): { startDate: Date; endDate: Date } {
    const current = new Date(date);
    const day = current.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    current.setDate(current.getDate() + diffToMonday);

    const startDate = this.toDayStart(current);
    const endDate = this.toDayEnd(new Date(current.getFullYear(), current.getMonth(), current.getDate() + 6));
    return { startDate, endDate };
  }

  private resolveMonthRange(year: number, month: number): { startDate: Date; endDate: Date } {
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return { startDate, endDate };
  }

  private resolveYearRange(year: number): { startDate: Date; endDate: Date } {
    const startDate = new Date(year, 0, 1, 0, 0, 0, 0);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    return { startDate, endDate };
  }

  private resolveIsoWeekRange(year: number, week: number): { startDate: Date; endDate: Date } {
    const januaryFourth = new Date(year, 0, 4);
    const januaryFourthDay = januaryFourth.getDay() || 7;
    const mondayOfWeekOne = new Date(januaryFourth);
    mondayOfWeekOne.setDate(januaryFourth.getDate() - januaryFourthDay + 1);

    const startDate = new Date(mondayOfWeekOne);
    startDate.setDate(mondayOfWeekOne.getDate() + (week - 1) * 7);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
  }

  private toDayStart(date: Date): Date {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    return day;
  }

  private toDayEnd(date: Date): Date {
    const day = new Date(date);
    day.setHours(23, 59, 59, 999);
    return day;
  }

  private formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private toDomainFiscalBill(entity: FiscalBillEntity): FiscalBill {
    return {
      id: entity.id,
      billNumber: undefined,
      saleType: entity.saleType,
      paymentMethod: entity.paymentMethod,
      soldItems: entity.soldItems.map((item) => ({
        productId: Number(item.productId),
        productName: item.productName,
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
      totalAmount: Number(entity.totalAmount),
      createdAt: entity.createdAt,
      userId: entity.userId,
    };
  }

  private toEntityFiscalBill(data: Partial<FiscalBill>): Partial<FiscalBillEntity> {
    return {
      id: data.id,
      saleType: data.saleType,
      paymentMethod: data.paymentMethod,
      soldItems: data.soldItems,
      totalAmount: data.totalAmount,
      createdAt: data.createdAt,
      userId: data.userId,
    };
  }

  private toDomainSalesReport(entity: SalesReportEntity): SalesReport {
    return {
      id: entity.id,
      periodType: entity.periodType,
      periodValue: entity.periodValue,
      totalSales: Number(entity.totalSales),
      totalUnitsSold: Number(entity.totalUnitsSold),
      revenue: Number(entity.revenue),
      details: (entity.details as Record<string, unknown> | undefined) as Record<string, any> | undefined,
      generatedAt: entity.generatedAt,
    };
  }

  private toEntitySalesReport(data: Partial<SalesReport>): Partial<SalesReportEntity> {
    return {
      id: data.id,
      periodType: data.periodType,
      periodValue: data.periodValue,
      totalSales: data.totalSales,
      totalUnitsSold: data.totalUnitsSold,
      revenue: data.revenue,
      details: data.details,
      generatedAt: data.generatedAt,
    };
  }

  private toDomainTopProductReport(entity: TopProductReportEntity): TopProductReport {
    const topProducts = Array.isArray(entity.topProducts)
      ? entity.topProducts.map((item) => ({
          productId: Number(item.productId),
          productName: item.productName,
          unitsSold: Number(item.unitsSold),
          revenue: Number(item.revenue),
          percentage: Number(item.percentage),
        }))
      : [];

    return {
      id: entity.id,
      period: entity.period,
      topProducts,
      totalRevenueFromTop: Number(entity.totalRevenueFromTop),
      generatedAt: entity.generatedAt,
    };
  }

  private toEntityTopProductReport(data: Partial<TopProductReport>): Partial<TopProductReportEntity> {
    const topProducts: TopProductItem[] = Array.isArray(data.topProducts)
      ? data.topProducts.map((item) => ({
          productId: Number(item.productId),
          productName: item.productName,
          unitsSold: Number(item.unitsSold),
          revenue: Number(item.revenue),
          percentage: Number(item.percentage ?? 0),
        }))
      : [];

    return {
      id: data.id,
      period: data.period,
      topProducts,
      totalRevenueFromTop: data.totalRevenueFromTop,
      generatedAt: data.generatedAt,
    };
  }

  private toDomainTrendAnalysis(entity: TrendAnalysisEntity): TrendAnalysis {
    const dataPoints = Array.isArray(entity.dataPoints)
      ? entity.dataPoints.map((point) => ({
          label: point.label,
          value: Number(point.value),
          date: point.date,
          productId: point.productId !== undefined ? Number(point.productId) : undefined,
        }))
      : [];

    return {
      id: entity.id,
      analysisType: entity.analysisType,
      dataPoints,
      conclusion: entity.conclusion,
      generatedAt: entity.generatedAt,
    };
  }

  private toEntityTrendAnalysis(data: Partial<TrendAnalysis>): Partial<TrendAnalysisEntity> {
    return {
      id: data.id,
      analysisType: data.analysisType,
      dataPoints: data.dataPoints?.map((point) => ({
        label: point.label,
        value: Number(point.value),
        date: point.date,
        productId: point.productId,
      })),
      conclusion: data.conclusion,
      generatedAt: data.generatedAt,
    };
  }
}
