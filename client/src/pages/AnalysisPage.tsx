import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Calendar,
  DollarSign,
  FileText,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../hooks/useAuthHook";
import { useServices } from "../contexts/ServiceContext";
import { FiscalBillDTO } from "../models/analysis/FiscalBillDTO";
import { SalesReportDTO } from "../models/analysis/SalesReportDTO";
import { TopProductReportDTO } from "../models/analysis/TopProductReportDTO";
import { TrendAnalysisDTO } from "../models/analysis/TrendAnalysisDTO";
import { formatCurrency, formatDate } from "../helpers/formatters";
import StatsCard from "../components/production/StatsCard";
import FiscalBillsTable from "../components/analysis/FiscalBillsTable";
import GenerateReportModel from "../components/analysis/GenerateReportModel";
import SalesAnalysisChart from "../components/analysis/SalesAnalysisChart";
import TopProductsTable from "../components/analysis/TopProductsTable";
import TrendAnalysisCard from "../components/analysis/TrendAnalysisCard";

type AnalysisTab = "overview" | "fiscal" | "sales" | "products" | "trends";
type ReportType = "sales" | "products" | "trends";
type SalesPeriodFilter = "all" | "daily" | "weekly" | "monthly" | "yearly" | "total";

const AnalysisPage: React.FC = () => {
  const { token } = useAuth();
  const { analysisAPI } = useServices();

  const [activeTab, setActiveTab] = useState<AnalysisTab>("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fiscalBills, setFiscalBills] = useState<FiscalBillDTO[]>([]);
  const [salesReports, setSalesReports] = useState<SalesReportDTO[]>([]);
  const [topProductsReports, setTopProductsReports] = useState<TopProductReportDTO[]>([]);
  const [trendAnalyses, setTrendAnalyses] = useState<TrendAnalysisDTO[]>([]);

  const [period, setPeriod] = useState("this-month");
  const [salesPeriodFilter, setSalesPeriodFilter] = useState<SalesPeriodFilter>("all");

  const [isGenerateReportModelOpen, setIsGenerateReportModelOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>("sales");

  const loadData = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [bills, sales, topProducts, trends] = await Promise.all([
        analysisAPI.getFiscalBills(token, period),
        analysisAPI.getSalesReports(token, salesPeriodFilter === "all" ? undefined : salesPeriodFilter),
        analysisAPI.getTopProductsReports(token),
        analysisAPI.getTrendAnalyses(token),
      ]);

      setFiscalBills(bills);
      setSalesReports(sales);
      setTopProductsReports(topProducts);
      setTrendAnalyses(trends);
    } catch (requestError) {
      setError("Greska pri ucitavanju podataka analitike.");
      console.error(requestError);
    } finally {
      setIsLoading(false);
    }
  }, [analysisAPI, token, period, salesPeriodFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const overviewStats = useMemo(() => {
    const toLocalDateKey = (iso: string): string => {
      const parsed = new Date(iso);
      if (Number.isNaN(parsed.getTime())) {
        return iso.slice(0, 10);
      }
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const totalRevenue = fiscalBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const totalUnits = fiscalBills.reduce(
      (sum, bill) => sum + bill.soldItems.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );
    const averageBillValue = fiscalBills.length > 0 ? totalRevenue / fiscalBills.length : 0;

    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`;
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayKey = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(yesterdayDate.getDate()).padStart(2, "0")}`;

    const todayRevenue = fiscalBills
      .filter((bill) => toLocalDateKey(bill.createdAt) === todayKey)
      .reduce((sum, bill) => sum + bill.totalAmount, 0);
    const yesterdayRevenue = fiscalBills
      .filter((bill) => toLocalDateKey(bill.createdAt) === yesterdayKey)
      .reduce((sum, bill) => sum + bill.totalAmount, 0);

    const revenueChange =
      yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalUnits,
      averageBillValue,
      totalBills: fiscalBills.length,
      todayRevenue,
      revenueChange,
    };
  }, [fiscalBills]);

  const latestTopProductsReport = useMemo(() => {
    return topProductsReports.find((report) => report.topProducts.length > 0) ?? topProductsReports[0];
  }, [topProductsReports]);
  const latestTrends = trendAnalyses.slice(0, 3);
  const recentSalesReports = salesReports.slice(0, 5);

  const handleExportPDF = async (
    id: number,
    type: "sales" | "products" | "trends" | "fiscal"
  ): Promise<void> => {
    if (!token) {
      return;
    }

    try {
      let blob: Blob;
      switch (type) {
        case "fiscal":
          blob = await analysisAPI.exportFiscalBillPDF(id, token);
          break;
        case "sales":
          blob = await analysisAPI.exportSalesReportPDF(id, token);
          break;
        case "products":
          blob = await analysisAPI.exportTopProductsPDF(id, token);
          break;
        case "trends":
          blob = await analysisAPI.exportTrendAnalysisPDF(id, token);
          break;
      }

      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${type}-report-${id}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
    } catch (requestError) {
      setError("Neuspesan PDF izvoz.");
      console.error(requestError);
    }
  };

  const handleGenerateReport = async (params: any): Promise<void> => {
    if (!token) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (reportType === "sales") {
        await analysisAPI.generateSalesAnalysis(params, token);
      } else if (reportType === "products") {
        await analysisAPI.generateTopProductsAnalysis(params, token);
      } else {
        await analysisAPI.generateTrendAnalysis(params, token);
      }

      await loadData();
      setIsGenerateReportModelOpen(false);
    } catch (requestError) {
      setError("Greska pri generisanju izvestaja.");
      console.error(requestError);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSalesReportList = (reports: SalesReportDTO[]) => {
    if (reports.length === 0) {
      return (
        <div className="empty-state">
          <p className="text-muted">Nema generisanih izvestaja prodaje.</p>
        </div>
      );
    }

    return (
      <div className="analysis-sales-report-list">
        {reports.map((report) => (
          <div key={report.id} className="analysis-sales-report-item">
            <div className="analysis-sales-report-item__header">
              <div>
                <h4 className="font-medium">
                  {report.periodType === "daily" && "Dnevni izvestaj"}
                  {report.periodType === "weekly" && "Nedeljni izvestaj"}
                  {report.periodType === "monthly" && "Mesecni izvestaj"}
                  {report.periodType === "yearly" && "Godisnji izvestaj"}
                  {report.periodType === "total" && "Ukupni izvestaj"}
                </h4>
                <p className="text-muted">
                  Period: {report.periodValue} | Generisano: {formatDate(report.generatedAt)}
                </p>
              </div>
              <button className="btn btn--outline btn--sm btn--pdf" onClick={() => void handleExportPDF(report.id, "sales")}>
                PDF
              </button>
            </div>
            <div className="analysis-sales-report-item__stats">
              <div>
                <p className="text-muted">Ukupna zarada</p>
                <p className="font-medium">{formatCurrency(report.revenue)}</p>
              </div>
              <div>
                <p className="text-muted">Prodate jedinice</p>
                <p className="font-medium">{report.totalUnitsSold.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted">Prosek po jedinici</p>
                <p className="font-medium">
                  {formatCurrency(
                    report.totalUnitsSold > 0 ? report.revenue / report.totalUnitsSold : 0
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="analysis-page">
      <div className="page-header page-header--with-action">
        <div>
          <h1 className="page-header__title">Analiza prodaje</h1>
          <p className="page-header__subtitle">
            Pregled performansi prodaje, trenda i izvestaja za PDF izvoz
          </p>
        </div>
        <div className="analysis-header-actions">
          <div className="input-group analysis-period-group">
            <label className="input-group__label">Period fiskalnih racuna</label>
            <div className="analysis-period-input">
              <Calendar size={16} />
              <select className="input select" value={period} onChange={(event) => setPeriod(event.target.value)}>
                <option value="today">Danas</option>
                <option value="yesterday">Juce</option>
                <option value="this-week">Ova nedelja</option>
                <option value="this-month">Ovaj mesec</option>
                <option value="last-month">Prosli mesec</option>
                <option value="this-year">Ova godina</option>
                <option value="all">Sve</option>
              </select>
            </div>
          </div>

          <button className="btn btn--outline" onClick={() => setIsGenerateReportModelOpen(true)}>
            <FileText size={16} />
            Generisi izvestaj
          </button>
          <button className="btn btn--secondary" onClick={() => void loadData()} disabled={isLoading}>
            <RefreshCw size={16} className={isLoading ? "icon-spin" : ""} />
            {isLoading ? "Osvezavanje..." : "Osvezi"}
          </button>
        </div>
      </div>

      {error && <div className="storage-alert storage-alert--error">{error}</div>}

      <div className="card">
        <div className="card__body analysis-tabs">
          <button
            className={`analysis-tab ${activeTab === "overview" ? "analysis-tab--active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <BarChart3 size={16} />
            Pregled
          </button>
          <button
            className={`analysis-tab ${activeTab === "fiscal" ? "analysis-tab--active" : ""}`}
            onClick={() => setActiveTab("fiscal")}
          >
            <FileText size={16} />
            Fiskalni racuni
          </button>
          <button
            className={`analysis-tab ${activeTab === "sales" ? "analysis-tab--active" : ""}`}
            onClick={() => setActiveTab("sales")}
          >
            <DollarSign size={16} />
            Prodaja
          </button>
          <button
            className={`analysis-tab ${activeTab === "products" ? "analysis-tab--active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <Package size={16} />
            Top proizvodi
          </button>
          <button
            className={`analysis-tab ${activeTab === "trends" ? "analysis-tab--active" : ""}`}
            onClick={() => setActiveTab("trends")}
          >
            <TrendingUp size={16} />
            Trendovi
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          <div className="stats-grid">
            <StatsCard icon={<DollarSign size={24} />} value={formatCurrency(overviewStats.totalRevenue)} label="Ukupna zarada" />
            <StatsCard icon={<ShoppingBag size={24} />} value={overviewStats.totalUnits.toLocaleString()} label="Prodate jedinice" />
            <StatsCard icon={<FileText size={24} />} value={overviewStats.totalBills} label="Broj fiskalnih racuna" />
            <StatsCard icon={<BarChart3 size={24} />} value={formatCurrency(overviewStats.averageBillValue)} label="Prosecna vrednost racuna" />
          </div>

          <div className="grid analysis-overview-grid">
            <div className="analysis-main-column">
              <div className="card">
                <div className="card__header">
                  <h2 className="card__title">
                    <BarChart3 size={20} className="card__title-icon" />
                    Grafikon prodaje
                  </h2>
                </div>
                <div className="card__body">
                  <SalesAnalysisChart salesReports={salesReports} height={320} />
                </div>
              </div>

              <div className="card">
                <div className="card__header">
                  <h2 className="card__title">
                    <FileText size={20} className="card__title-icon" />
                    Poslednji izvestaji prodaje
                  </h2>
                </div>
                <div className="card__body">{renderSalesReportList(recentSalesReports)}</div>
              </div>
            </div>

            <div className="analysis-side-column">
              <div className="card">
                <div className="card__header">
                  <h2 className="card__title">
                    <Package size={20} className="card__title-icon" />
                    Top proizvodi
                  </h2>
                </div>
                <div className="card__body">
                  <TopProductsTable
                    products={latestTopProductsReport?.topProducts.slice(0, 5) ?? []}
                    compact
                  />
                </div>
              </div>

              <div className="card">
                <div className="card__header">
                  <h2 className="card__title">
                    <TrendingUp size={20} className="card__title-icon" />
                    Najnoviji trendovi
                  </h2>
                </div>
                <div className="card__body analysis-trend-preview-list">
                  {latestTrends.length === 0 ? (
                    <p className="text-muted">Nema generisanih trend analiza.</p>
                  ) : (
                    latestTrends.map((analysis) => (
                      <TrendAnalysisCard
                        key={analysis.id}
                        analysis={analysis}
                        compact
                        onExport={() => void handleExportPDF(analysis.id, "trends")}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "fiscal" && (
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">
              <FileText size={20} className="card__title-icon" />
              Fiskalni racuni
            </h2>
            <span className="text-muted">Prikazano: {fiscalBills.length}</span>
          </div>
          <div className="card__body">
            <FiscalBillsTable bills={fiscalBills} onExport={handleExportPDF} isLoading={isLoading} />
          </div>
        </div>
      )}

      {activeTab === "sales" && (
        <div className="grid analysis-sales-grid">
          <div className="card">
            <div className="card__header">
              <h2 className="card__title">
                <DollarSign size={20} className="card__title-icon" />
                Izvestaji prodaje
              </h2>
            </div>
            <div className="card__body">{renderSalesReportList(salesReports)}</div>
          </div>

          <div className="card">
            <div className="card__header">
              <h2 className="card__title">
                <Calendar size={20} className="card__title-icon" />
                Filteri
              </h2>
            </div>
            <div className="card__body analysis-filter-panel">
              <div className="input-group">
                <label className="input-group__label">Tip perioda izvestaja</label>
                <select
                  className="input select"
                  value={salesPeriodFilter}
                  onChange={(event) => setSalesPeriodFilter(event.target.value as SalesPeriodFilter)}
                >
                  <option value="all">Svi</option>
                  <option value="daily">Dnevni</option>
                  <option value="weekly">Nedeljni</option>
                  <option value="monthly">Mesecni</option>
                  <option value="yearly">Godisnji</option>
                  <option value="total">Ukupni</option>
                </select>
              </div>

              <button className="btn btn--secondary" onClick={() => void loadData()} disabled={isLoading}>
                <RefreshCw size={16} className={isLoading ? "icon-spin" : ""} />
                Primeni
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">
              <Package size={20} className="card__title-icon" />
              Top proizvodi
            </h2>
            {latestTopProductsReport && (
              <button
                className="btn btn--outline btn--sm btn--pdf"
                onClick={() => void handleExportPDF(latestTopProductsReport.id, "products")}
              >
                PDF
              </button>
            )}
          </div>
          <div className="card__body">
            {latestTopProductsReport ? (
              <>
                <p className="text-muted mb-md">Period: {latestTopProductsReport.period}</p>
                <TopProductsTable products={latestTopProductsReport.topProducts} />
              </>
            ) : (
              <div className="empty-state">
                <p className="text-muted">Nema generisanih top-products izvestaja.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "trends" && (
        <div className="analysis-trends-grid">
          {trendAnalyses.length === 0 ? (
            <div className="card">
              <div className="card__body empty-state">
                <p className="text-muted">Nema generisanih analiza trenda.</p>
              </div>
            </div>
          ) : (
            trendAnalyses.map((analysis) => (
              <TrendAnalysisCard
                key={analysis.id}
                analysis={analysis}
                onExport={() => void handleExportPDF(analysis.id, "trends")}
              />
            ))
          )}
        </div>
      )}

      <GenerateReportModel
        isOpen={isGenerateReportModelOpen}
        onClose={() => setIsGenerateReportModelOpen(false)}
        onGenerate={handleGenerateReport}
        reportType={reportType}
        setReportType={setReportType}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AnalysisPage;
