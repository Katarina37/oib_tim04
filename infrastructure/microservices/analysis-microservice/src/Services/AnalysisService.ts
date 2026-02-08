import PDFDocument from "pdfkit";
import { CreateFiscalBillDTO } from "../Domain/DTOs/CreateFiscalBillDTO";
import { SalesAnalysisDTO } from "../Domain/DTOs/SalesAnalysisDTO";
import { TrendAnalysisDTO } from "../Domain/DTOs/TrendAnalysisDTO";
import { LogLevel } from "../Domain/enums/LogLevel";
import { FiscalBill } from "../Domain/models/FiscalBill";
import { SalesReport } from "../Domain/models/SalesReport";
import { TopProductReport } from "../Domain/models/TopProductReport";
import { TrendAnalysis } from "../Domain/models/TrendAnalysis";
import { IAnalysisRepository } from "../Domain/services/IAnalysisRepository";
import { IAnalysisService } from "../Domain/services/IAnalysisService";
import { ILoggerService } from "../Domain/services/ILoggerService";

type DateRange = {
  startDate: Date;
  endDate: Date;
};

type ResolvedSalesPeriod = DateRange & {
  normalizedValue: string;
};

type ResolvedGeneralPeriod = DateRange & {
  normalizedPeriod: string;
};

type TrendPoint = {
  date: string;
  sales: number;
};

export class AnalysisService implements IAnalysisService {
  constructor(
    private readonly analysisRepository: IAnalysisRepository,
    private readonly logger: ILoggerService
  ) {}

  async createFiscalBill(data: CreateFiscalBillDTO): Promise<FiscalBill> {
    try {
      const totalAmount = data.soldItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const bill = await this.analysisRepository.createFiscalBill({
        saleType: data.saleType,
        paymentMethod: data.paymentMethod,
        soldItems: data.soldItems,
        totalAmount,
        userId: data.userId,
      });

      await this.logger.log(`Kreiran fiskalni racun ${bill.id}`, LogLevel.INFO, {
        additionalData: { billId: bill.id, totalAmount },
      });
      return bill;
    } catch (error) {
      await this.logger.log(
        `Greska pri kreiranju fiskalnog racuna: ${(error as Error).message}`,
        LogLevel.ERROR,
        { additionalData: { billData: data } }
      );
      throw error;
    }
  }

  async getFiscalBills(period?: string): Promise<FiscalBill[]> {
    try {
      if (period) {
        if (period === "all") {
          return this.analysisRepository.findFiscalBillsByPeriod("all");
        }
        return this.analysisRepository.findFiscalBillsByPeriod(period);
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      return this.analysisRepository.findFiscalBillsByDateRange(startDate, endDate);
    } catch (error) {
      await this.logger.log(
        `Greska pri dobavljanju fiskalnih racuna: ${(error as Error).message}`,
        LogLevel.ERROR
      );
      throw error;
    }
  }

  async getFiscalBillById(id: number): Promise<FiscalBill> {
    const bill = await this.analysisRepository.findFiscalBillById(id);
    if (!bill) {
      throw new Error(`Fiskalni racun sa ID ${id} nije pronadjen`);
    }
    return bill;
  }

  async generateSalesAnalysis(params: SalesAnalysisDTO): Promise<SalesReport> {
    try {
      const resolvedPeriod = this.resolveSalesPeriod(params.periodType, params.periodValue);

      const existing = await this.analysisRepository.findSalesReportByPeriod(
        params.periodType,
        resolvedPeriod.normalizedValue
      );

      if (existing) {
        await this.logger.log(
          `Koristi se postojeci izvestaj prodaje za period ${resolvedPeriod.normalizedValue}`,
          LogLevel.INFO
        );
        return existing;
      }

      const { totalSales, totalRevenue } = await this.analysisRepository.getTotalSalesByDateRange(
        resolvedPeriod.startDate,
        resolvedPeriod.endDate
      );
      const topProducts = await this.analysisRepository.getTopProductsByDateRange(
        resolvedPeriod.startDate,
        resolvedPeriod.endDate,
        5
      );

      const report = await this.analysisRepository.createSalesReport({
        periodType: params.periodType,
        periodValue: resolvedPeriod.normalizedValue,
        totalSales,
        totalUnitsSold: totalSales,
        revenue: totalRevenue,
        details: {
          topProducts,
          averageSaleValue: totalSales > 0 ? totalRevenue / totalSales : 0,
        },
        generatedAt: new Date(),
      });

      await this.logger.log(
        `Generisan izvestaj prodaje za period ${resolvedPeriod.normalizedValue}`,
        LogLevel.INFO,
        { additionalData: { reportId: report.id, totalRevenue, totalSales } }
      );
      return report;
    } catch (error) {
      await this.logger.log(
        `Greska pri generisanju izvestaja prodaje: ${(error as Error).message}`,
        LogLevel.ERROR,
        { additionalData: { params } }
      );
      throw error;
    }
  }

  async generateTopProductsAnalysis(period: string): Promise<TopProductReport> {
    try {
      const resolvedPeriod = this.resolveGeneralPeriod(period);
      const existing = await this.analysisRepository.findTopProductReportByPeriod(
        resolvedPeriod.normalizedPeriod
      );

      if (existing) {
        return existing;
      }

      const topProducts = await this.analysisRepository.getTopProductsByDateRange(
        resolvedPeriod.startDate,
        resolvedPeriod.endDate,
        10
      );
      const totalRevenueFromTop = topProducts.reduce((sum, product) => sum + product.revenue, 0);

      if (topProducts.length === 0 || totalRevenueFromTop <= 0) {
        return this.analysisRepository.createTopProductReport({
          period: resolvedPeriod.normalizedPeriod,
          topProducts: [],
          totalRevenueFromTop: 0,
          generatedAt: new Date(),
        });
      }

      const productsWithPercentage = topProducts.map((product) => ({
        ...product,
        percentage: (product.revenue / totalRevenueFromTop) * 100,
      }));

      const report = await this.analysisRepository.createTopProductReport({
        period: resolvedPeriod.normalizedPeriod,
        topProducts: productsWithPercentage,
        totalRevenueFromTop,
        generatedAt: new Date(),
      });

      await this.logger.log(
        `Generisan izvestaj top 10 proizvoda za period ${resolvedPeriod.normalizedPeriod}`,
        LogLevel.INFO,
        { additionalData: { reportId: report.id, period: resolvedPeriod.normalizedPeriod } }
      );
      return report;
    } catch (error) {
      await this.logger.log(
        `Greska pri generisanju izvestaja top proizvoda: ${(error as Error).message}`,
        LogLevel.ERROR,
        { additionalData: { period } }
      );
      throw error;
    }
  }

  async generateTrendAnalysis(params: TrendAnalysisDTO): Promise<TrendAnalysis> {
    try {
      const endDate = this.parseDateOrDefault(params.endDate, new Date());
      const defaultStart = new Date(endDate.getFullYear(), endDate.getMonth() - 6, 1);
      const startDate = this.parseDateOrDefault(params.startDate, defaultStart);

      const salesTrend = await this.analysisRepository.getSalesTrend(startDate, endDate);

      if (salesTrend.length === 0) {
        return this.analysisRepository.createTrendAnalysis({
          analysisType: params.analysisType,
          dataPoints: [],
          conclusion: "Nema dovoljno podataka za analizu",
          generatedAt: new Date(),
        });
      }

      const report = await this.analysisRepository.createTrendAnalysis({
        analysisType: params.analysisType,
        dataPoints: salesTrend.map((point) => ({
          label: point.date,
          value: point.sales,
          date: point.date,
        })),
        conclusion: this.generateConclusion(salesTrend),
        generatedAt: new Date(),
      });

      await this.logger.log(`Generisana analiza trenda ${params.analysisType}`, LogLevel.INFO, {
        additionalData: { reportId: report.id, dataPoints: salesTrend.length },
      });
      return report;
    } catch (error) {
      await this.logger.log(
        `Greska pri generisanju analize trenda: ${(error as Error).message}`,
        LogLevel.ERROR,
        { additionalData: { params } }
      );
      throw error;
    }
  }

  async getSalesReports(periodType?: SalesAnalysisDTO["periodType"]): Promise<SalesReport[]> {
    return this.analysisRepository.findAllSalesReports(periodType);
  }

  async getTopProductsReports(): Promise<TopProductReport[]> {
    return this.analysisRepository.findAllTopProductsReports();
  }

  async getTrendAnalyses(analysisType?: TrendAnalysisDTO["analysisType"]): Promise<TrendAnalysis[]> {
    if (analysisType) {
      return this.analysisRepository.findTrendAnalysisByType(analysisType);
    }
    return this.analysisRepository.findAllTrendAnalyses();
  }

  async exportAnalysisToPDF(
    reportId: number,
    reportType: "sales" | "top" | "trend"
  ): Promise<Buffer> {
    switch (reportType) {
      case "sales":
        return this.exportSalesReportToPDF(reportId);
      case "top":
        return this.exportTopProductsReportToPDF(reportId);
      case "trend":
        return this.exportTrendReportToPDF(reportId);
      default:
        throw new Error("Nepodrzan tip izvestaja");
    }
  }

  async exportFiscalBillToPDF(billId: number): Promise<Buffer> {
    const bill = await this.getFiscalBillById(billId);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));

        doc.fontSize(18).text("FISKALNI RACUN", { align: "center" });
        doc.moveDown(0.5);
        doc.fontSize(10).text(`Broj: ${bill.id}`);
        doc.text(`Datum: ${bill.createdAt.toLocaleDateString("sr-RS")}`);
        doc.moveDown();

        doc.fontSize(12).text("Stavke:", { underline: true });
        doc.moveDown(0.5);

        bill.soldItems.forEach((item, index) => {
          doc
            .fontSize(10)
            .text(
              `${index + 1}. ${item.productName} x${item.quantity} - ${(item.price * item.quantity).toFixed(
                2
              )} RSD`
            );
        });

        doc.moveDown();
        doc.fontSize(12).text(`Ukupan iznos: ${bill.totalAmount.toFixed(2)} RSD`, { align: "right" });
        doc.moveDown();
        doc.text(`Nacin placanja: ${bill.paymentMethod}`);
        doc.text(`Tip prodaje: ${bill.saleType}`);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private async exportSalesReportToPDF(reportId: number): Promise<Buffer> {
    const report = await this.analysisRepository.findSalesReportById(reportId);
    if (!report) {
      throw new Error(`Izvestaj prodaje sa ID ${reportId} nije pronadjen`);
    }

    const topProducts = Array.isArray(report.details?.topProducts)
      ? report.details.topProducts
      : [];
    const averageSaleValue =
      typeof report.details?.averageSaleValue === "number"
        ? report.details.averageSaleValue
        : report.totalSales > 0
          ? report.revenue / report.totalSales
          : 0;

    return this.generatePdf((doc) => {
      doc.fontSize(18).text("IZVESTAJ PRODAJE", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`ID: ${report.id}`);
      doc.text(`Datum generisanja: ${report.generatedAt.toLocaleDateString("sr-RS")}`);
      doc.text(`Tip perioda: ${this.getPeriodTypeLabel(report.periodType)}`);
      doc.text(`Period: ${report.periodValue}`);
      doc.moveDown();

      doc.fontSize(12).text(`Ukupno prodatih jedinica: ${report.totalSales.toLocaleString()}`);
      doc.text(`Ukupna zarada: ${report.revenue.toFixed(2)} RSD`);
      doc.text(`Prosecna vrednost po jedinici: ${averageSaleValue.toFixed(2)} RSD`);

      doc.moveDown();
      doc.fontSize(12).text("Top proizvodi:", { underline: true });
      doc.moveDown(0.5);

      if (topProducts.length === 0) {
        doc.fontSize(10).text("Nema podataka za izabrani period.");
      } else {
        topProducts.forEach((item, index) => {
          doc
            .fontSize(10)
            .text(
              `${index + 1}. ${item.productName} - ${item.unitsSold} kom - ${Number(item.revenue).toFixed(2)} RSD`
            );
        });
      }
    });
  }

  private async exportTopProductsReportToPDF(reportId: number): Promise<Buffer> {
    const report = await this.analysisRepository.findTopProductReportById(reportId);
    if (!report) {
      throw new Error(`Top proizvodi izvestaj sa ID ${reportId} nije pronadjen`);
    }

    return this.generatePdf((doc) => {
      doc.fontSize(18).text("TOP PROIZVODI", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`ID: ${report.id}`);
      doc.text(`Datum generisanja: ${report.generatedAt.toLocaleDateString("sr-RS")}`);
      doc.text(`Period: ${report.period}`);
      doc.text(`Ukupan prihod top proizvoda: ${report.totalRevenueFromTop.toFixed(2)} RSD`);
      doc.moveDown();

      doc.fontSize(12).text("Lista proizvoda:", { underline: true });
      doc.moveDown(0.5);

      if (report.topProducts.length === 0) {
        doc.fontSize(10).text("Nema podataka za izabrani period.");
      } else {
        report.topProducts.forEach((product, index) => {
          doc
            .fontSize(10)
            .text(
              `${index + 1}. ${product.productName} - ${product.unitsSold} kom - ${product.revenue.toFixed(
                2
              )} RSD (${product.percentage.toFixed(1)}%)`
            );
        });
      }
    });
  }

  private async exportTrendReportToPDF(reportId: number): Promise<Buffer> {
    const report = await this.analysisRepository.findTrendAnalysisById(reportId);
    if (!report) {
      throw new Error(`Trend analiza sa ID ${reportId} nije pronadjena`);
    }

    return this.generatePdf((doc) => {
      doc.fontSize(18).text("ANALIZA TRENDA", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`ID: ${report.id}`);
      doc.text(`Datum generisanja: ${report.generatedAt.toLocaleDateString("sr-RS")}`);
      doc.text(`Tip analize: ${this.getTrendTypeLabel(report.analysisType)}`);
      doc.text(`Zakljucak: ${report.conclusion ?? "Nema zakljucka"}`);
      doc.moveDown();

      doc.fontSize(12).text("Tacke trenda:", { underline: true });
      doc.moveDown(0.5);

      if (report.dataPoints.length === 0) {
        doc.fontSize(10).text("Nema podataka za izabrani period.");
      } else {
        report.dataPoints.slice(0, 30).forEach((point, index) => {
          doc.fontSize(10).text(`${index + 1}. ${point.label}: ${point.value}`);
        });

        if (report.dataPoints.length > 30) {
          doc.moveDown(0.5);
          doc.fontSize(9).text(`Prikazano prvih 30 od ukupno ${report.dataPoints.length} tacaka.`);
        }
      }
    });
  }

  private generatePdf(renderContent: (doc: InstanceType<typeof PDFDocument>) => void): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const chunks: Buffer[] = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));

        renderContent(doc);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private resolveSalesPeriod(
    periodType: SalesAnalysisDTO["periodType"],
    periodValue: string
  ): ResolvedSalesPeriod {
    switch (periodType) {
      case "daily": {
        const date = this.resolveSingleDate(periodValue);
        return {
          startDate: this.toDayStart(date),
          endDate: this.toDayEnd(date),
          normalizedValue: this.formatDate(date),
        };
      }
      case "weekly": {
        const weeklyRange = this.resolveWeeklyRange(periodValue);
        return {
          ...weeklyRange,
          normalizedValue: this.toIsoWeekCode(weeklyRange.startDate),
        };
      }
      case "monthly": {
        const monthRange = this.resolveMonthlyRange(periodValue);
        return {
          ...monthRange,
          normalizedValue: `${monthRange.startDate.getFullYear()}-${String(
            monthRange.startDate.getMonth() + 1
          ).padStart(2, "0")}`,
        };
      }
      case "yearly": {
        const year = this.resolveYear(periodValue);
        return {
          startDate: new Date(year, 0, 1, 0, 0, 0, 0),
          endDate: new Date(year, 11, 31, 23, 59, 59, 999),
          normalizedValue: String(year),
        };
      }
      case "total":
      default:
        return {
          startDate: new Date(2000, 0, 1, 0, 0, 0, 0),
          endDate: new Date(2100, 11, 31, 23, 59, 59, 999),
          normalizedValue: "all",
        };
    }
  }

  private resolveGeneralPeriod(period: string): ResolvedGeneralPeriod {
    const normalized = (period ?? "").trim().toLowerCase();
    const now = new Date();

    if (!normalized || normalized === "today") {
      return {
        startDate: this.toDayStart(now),
        endDate: this.toDayEnd(now),
        normalizedPeriod: "today",
      };
    }

    if (normalized === "yesterday") {
      const date = new Date(now);
      date.setDate(date.getDate() - 1);
      return {
        startDate: this.toDayStart(date),
        endDate: this.toDayEnd(date),
        normalizedPeriod: "yesterday",
      };
    }

    if (normalized === "this-week" || normalized === "last-week") {
      const anchor = new Date(now);
      if (normalized === "last-week") {
        anchor.setDate(anchor.getDate() - 7);
      }
      const range = this.weekRangeFromDate(anchor);
      return {
        ...range,
        normalizedPeriod: this.toIsoWeekCode(range.startDate),
      };
    }

    if (normalized === "this-month" || normalized === "last-month") {
      const monthDate =
        normalized === "last-month" ? new Date(now.getFullYear(), now.getMonth() - 1, 1) : now;
      const startDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 0, 0, 0, 0);
      const endDate = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
      return {
        startDate,
        endDate,
        normalizedPeriod: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`,
      };
    }

    if (normalized === "this-year" || normalized === "last-year") {
      const year = normalized === "last-year" ? now.getFullYear() - 1 : now.getFullYear();
      return {
        startDate: new Date(year, 0, 1, 0, 0, 0, 0),
        endDate: new Date(year, 11, 31, 23, 59, 59, 999),
        normalizedPeriod: String(year),
      };
    }

    if (normalized === "all" || normalized === "total") {
      return {
        startDate: new Date(2000, 0, 1, 0, 0, 0, 0),
        endDate: new Date(2100, 11, 31, 23, 59, 59, 999),
        normalizedPeriod: "all",
      };
    }

    if (/^\d{4}$/.test(normalized)) {
      const year = Number(normalized);
      return {
        startDate: new Date(year, 0, 1, 0, 0, 0, 0),
        endDate: new Date(year, 11, 31, 23, 59, 59, 999),
        normalizedPeriod: normalized,
      };
    }

    if (/^\d{4}-\d{2}$/.test(normalized)) {
      const [yearRaw, monthRaw] = normalized.split("-");
      const year = Number(yearRaw);
      const month = Number(monthRaw);
      if (month >= 1 && month <= 12) {
        return {
          startDate: new Date(year, month - 1, 1, 0, 0, 0, 0),
          endDate: new Date(year, month, 0, 23, 59, 59, 999),
          normalizedPeriod: normalized,
        };
      }
    }

    if (/^\d{4}-w\d{2}$/i.test(normalized)) {
      const [yearRaw, weekRaw] = normalized.split("-w");
      const range = this.weekRangeFromIso(Number(yearRaw), Number(weekRaw));
      return {
        ...range,
        normalizedPeriod: this.toIsoWeekCode(range.startDate),
      };
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      const parsed = new Date(normalized);
      if (!Number.isNaN(parsed.getTime())) {
        return {
          startDate: this.toDayStart(parsed),
          endDate: this.toDayEnd(parsed),
          normalizedPeriod: this.formatDate(parsed),
        };
      }
    }

    return {
      startDate: this.toDayStart(now),
      endDate: this.toDayEnd(now),
      normalizedPeriod: "today",
    };
  }

  private resolveSingleDate(periodValue: string): Date {
    const normalized = (periodValue ?? "").trim().toLowerCase();
    const now = new Date();

    if (!normalized || normalized === "today") {
      return now;
    }

    if (normalized === "yesterday") {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      const parsed = new Date(normalized);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return now;
  }

  private resolveWeeklyRange(periodValue: string): DateRange {
    const normalized = (periodValue ?? "").trim().toLowerCase();
    const now = new Date();

    if (!normalized || normalized === "this-week") {
      return this.weekRangeFromDate(now);
    }

    if (normalized === "last-week") {
      const lastWeekDate = new Date(now);
      lastWeekDate.setDate(lastWeekDate.getDate() - 7);
      return this.weekRangeFromDate(lastWeekDate);
    }

    if (/^\d{4}-w\d{2}$/i.test(normalized)) {
      const [yearRaw, weekRaw] = normalized.split("-w");
      return this.weekRangeFromIso(Number(yearRaw), Number(weekRaw));
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      const parsed = new Date(normalized);
      if (!Number.isNaN(parsed.getTime())) {
        return this.weekRangeFromDate(parsed);
      }
    }

    return this.weekRangeFromDate(now);
  }

  private resolveMonthlyRange(periodValue: string): DateRange {
    const normalized = (periodValue ?? "").trim().toLowerCase();
    const now = new Date();

    if (!normalized || normalized === "this-month") {
      return {
        startDate: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
      };
    }

    if (normalized === "last-month") {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return {
        startDate: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 0, 0, 0, 0),
        endDate: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999),
      };
    }

    if (/^\d{4}-\d{2}$/.test(normalized)) {
      const [yearRaw, monthRaw] = normalized.split("-");
      const year = Number(yearRaw);
      const month = Number(monthRaw);
      if (month >= 1 && month <= 12) {
        return {
          startDate: new Date(year, month - 1, 1, 0, 0, 0, 0),
          endDate: new Date(year, month, 0, 23, 59, 59, 999),
        };
      }
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      const parsed = new Date(normalized);
      if (!Number.isNaN(parsed.getTime())) {
        return {
          startDate: new Date(parsed.getFullYear(), parsed.getMonth(), 1, 0, 0, 0, 0),
          endDate: new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0, 23, 59, 59, 999),
        };
      }
    }

    return {
      startDate: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  }

  private resolveYear(periodValue: string): number {
    const normalized = (periodValue ?? "").trim().toLowerCase();
    const nowYear = new Date().getFullYear();

    if (!normalized || normalized === "this-year") {
      return nowYear;
    }

    if (normalized === "last-year") {
      return nowYear - 1;
    }

    if (/^\d{4}$/.test(normalized)) {
      return Number(normalized);
    }

    if (/^\d{4}-\d{2}$/.test(normalized)) {
      return Number(normalized.split("-")[0]);
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      return Number(normalized.split("-")[0]);
    }

    return nowYear;
  }

  private weekRangeFromDate(date: Date): DateRange {
    const current = new Date(date);
    const day = current.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    current.setDate(current.getDate() + diffToMonday);

    const startDate = this.toDayStart(current);
    const endDate = this.toDayEnd(new Date(current.getFullYear(), current.getMonth(), current.getDate() + 6));
    return { startDate, endDate };
  }

  private weekRangeFromIso(year: number, week: number): DateRange {
    const januaryFourth = new Date(year, 0, 4);
    const januaryFourthDay = januaryFourth.getDay() || 7;
    const mondayOfWeekOne = new Date(januaryFourth);
    mondayOfWeekOne.setDate(januaryFourth.getDate() - januaryFourthDay + 1);

    const startDate = new Date(mondayOfWeekOne);
    startDate.setDate(startDate.getDate() + (week - 1) * 7);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  }

  private parseDateOrDefault(value: unknown, fallback: Date): Date {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return fallback;
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

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private toIsoWeekCode(date: Date): string {
    const normalized = this.toDayStart(date);
    const dayNr = (normalized.getDay() + 6) % 7;
    normalized.setDate(normalized.getDate() - dayNr + 3);
    const firstThursday = new Date(normalized.getFullYear(), 0, 4);
    const firstThursdayDayNr = (firstThursday.getDay() + 6) % 7;
    firstThursday.setDate(firstThursday.getDate() - firstThursdayDayNr + 3);
    const weekNo = 1 + Math.round((normalized.getTime() - firstThursday.getTime()) / 604800000);
    const weekYear = normalized.getFullYear();
    return `${weekYear}-W${String(weekNo).padStart(2, "0")}`;
  }

  private getPeriodTypeLabel(periodType: SalesAnalysisDTO["periodType"]): string {
    switch (periodType) {
      case "daily":
        return "Dnevni";
      case "weekly":
        return "Nedeljni";
      case "monthly":
        return "Mesecni";
      case "yearly":
        return "Godisnji";
      case "total":
        return "Ukupno";
      default:
        return periodType;
    }
  }

  private getTrendTypeLabel(analysisType: TrendAnalysisDTO["analysisType"]): string {
    switch (analysisType) {
      case "monthly_trend":
        return "Mesecni trend";
      case "product_trend":
        return "Trend po proizvodu";
      case "category_trend":
        return "Trend po kategoriji";
      default:
        return analysisType;
    }
  }

  private generateConclusion(trendData: TrendPoint[]): string {
    if (trendData.length < 2) {
      return "Nedovoljno podataka za analizu trenda";
    }

    const first = trendData[0].sales;
    const last = trendData[trendData.length - 1].sales;

    if (first === 0 && last === 0) {
      return "Stabilan trend prodaje";
    }

    if (first === 0 && last > 0) {
      return "Rastuci trend prodaje";
    }

    const change = ((last - first) / first) * 100;

    if (change > 10) {
      return "Rastuci trend prodaje";
    }
    if (change < -10) {
      return "Opadajuci trend prodaje";
    }

    return "Stabilan trend prodaje";
  }
}
