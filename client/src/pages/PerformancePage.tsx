import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Gauge,
  History,
  Info,
  PlayCircle,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../hooks/useAuthHook";
import { useServices } from "../contexts/ServiceContext";
import { PerformanceReportDTO } from "../models/performance/PerformanceReportDTO";
import { CreatePerformanceParams } from "../models/performance/CreatePerformanceParams";
import StatsCard from "../components/production/StatsCard";
import PerformanceSimulationForm from "../components/performance/PerformanceSimulationForm";
import PerformanceReportsTable from "../components/performance/PerformanceReportsTable";
import EfficiencyComparisonChart from "../components/performance/EfficiencyComparisonChart";
import AlgorithmAnalysisConclusions from "../components/performance/AlgorithmAnalysisConclusions";

type PerformanceTab = "simulate" | "compare" | "history";

const PerformancePage: React.FC = () => {
  const { token } = useAuth();
  const { performanceAPI } = useServices();

  const [activeTab, setActiveTab] = useState<PerformanceTab>("simulate");
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [isRunningSimulation, setIsRunningSimulation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<PerformanceReportDTO[]>([]);
  const [selectedReport, setSelectedReport] = useState<PerformanceReportDTO | null>(null);

  const loadReports = useCallback(async (): Promise<void> => {
    if (!token) {
      return;
    }

    setIsLoadingReports(true);
    setError(null);

    try {
      const data = await performanceAPI.getReports(token);
      setReports(data);
      setSelectedReport((current) => current ?? data[0] ?? null);
    } catch (requestError) {
      console.error(requestError);
      setError("Greska pri učitavanju istorije performansi.");
    } finally {
      setIsLoadingReports(false);
    }
  }, [performanceAPI, token]);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const handleRunSimulation = async (params: CreatePerformanceParams): Promise<void> => {
    if (!token) {
      return;
    }

    setIsRunningSimulation(true);
    setError(null);

    try {
      const createdReport = await performanceAPI.runSimulation(params, token);
      setReports((current) => [createdReport, ...current]);
      setSelectedReport(createdReport);
      setActiveTab("compare");
    } catch (requestError) {
      console.error(requestError);
      setError("Neuspešno pokretanje simulacije. Proverite unete parametre.");
    } finally {
      setIsRunningSimulation(false);
    }
  };

  const handleExportPDF = async (id: number): Promise<void> => {
    if (!token) {
      return;
    }

    try {
      const blob = await performanceAPI.exportPerformancePDF(id, token);
      const url = window.URL.createObjectURL(blob);
      const report = reports.find((item) => item.id === id);
      const fileName = `performance-${report?.naziv ?? id}.pdf`;

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
    } catch (requestError) {
      console.error(requestError);
      setError("Neuspešan PDF izvoz performansi.");
    }
  };

  const stats = useMemo(() => {
    const total = reports.length;
    const averageEfficiency =
      total > 0
        ? reports.reduce((sum, report) => sum + report.efikasnost_procenat, 0) / total
        : 0;
    const averageThroughput =
      total > 0 ? reports.reduce((sum, report) => sum + report.brzina_obrade, 0) / total : 0;
    const best = reports.reduce<PerformanceReportDTO | null>((currentBest, report) => {
      if (!currentBest || report.efikasnost_procenat > currentBest.efikasnost_procenat) {
        return report;
      }
      return currentBest;
    }, null);

    return {
      total,
      averageEfficiency,
      averageThroughput,
      bestAlgorithm:
        best?.tip_algoritma === "distributivni_centar"
          ? "Distributivni centar"
          : best
            ? "Magacinski centar"
            : "-",
    };
  }, [reports]);

  const isBusy = isLoadingReports || isRunningSimulation;

  return (
    <div className="analysis-page performance-page">
      <div className="page-header page-header--with-action">
        <div>
          <h1 className="page-header__title">Analiza performansi</h1>
          <p className="page-header__subtitle">
            Simulacija logističkih algoritama i pregled efikasnosti rada.
          </p>
        </div>
        <div className="performance-header-actions">
          <button className="btn btn--secondary" onClick={() => void loadReports()} disabled={isBusy}>
            <RefreshCw size={16} className={isLoadingReports ? "icon-spin" : ""} />
            {isLoadingReports ? "Osvežavanje..." : "Osveži"}
          </button>
        </div>
      </div>

      {error && (
        <div className="storage-alert storage-alert--error">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="stats-grid">
        <StatsCard icon={<History size={24} />} value={stats.total} label="Ukupno simulacija" />
        <StatsCard
          icon={<BarChart3 size={24} />}
          value={`${stats.averageEfficiency.toFixed(2)}%`}
          label="Prosečna efikasnost"
        />
        <StatsCard
          icon={<Gauge size={24} />}
          value={`${stats.averageThroughput.toFixed(3)} amb/s`}
          label="Prosečna brzina obrade"
        />
        <StatsCard icon={<TrendingUp size={24} />} value={stats.bestAlgorithm} label="Najbolji algoritam" />
      </div>

      <div className="card">
        <div className="card__body performance-tabs">
          <button
            className={`performance-tab ${activeTab === "simulate" ? "performance-tab--active" : ""}`}
            onClick={() => setActiveTab("simulate")}
          >
            <PlayCircle size={16} />
            Nova simulacija
          </button>
          <button
            className={`performance-tab ${activeTab === "compare" ? "performance-tab--active" : ""}`}
            onClick={() => setActiveTab("compare")}
          >
            <BarChart3 size={16} />
            Poređenje rezultata
          </button>
          <button
            className={`performance-tab ${activeTab === "history" ? "performance-tab--active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            <History size={16} />
            Istorija izveštaja
          </button>
        </div>
      </div>

      {activeTab === "simulate" && (
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">
              <PlayCircle size={20} className="card__title-icon" />
              Parametri simulacije
            </h2>
          </div>
          <div className="card__body">
            <PerformanceSimulationForm onRunSimulation={handleRunSimulation} isLoading={isRunningSimulation} />
          </div>
        </div>
      )}

      {activeTab === "compare" && (
        <div className="grid performance-compare-grid">
          <div className="card">
            <div className="card__header">
              <h2 className="card__title">
                <BarChart3 size={20} className="card__title-icon" />
                Uporedni pregled efikasnosti
              </h2>
            </div>
            <div className="card__body">
              <EfficiencyComparisonChart reports={reports} />
            </div>
          </div>

          <AlgorithmAnalysisConclusions selectedReport={selectedReport} />

          {reports.length === 0 && (
            <div className="card">
              <div className="card__body performance-empty-state">
                <Info size={42} />
                <p>Nema podataka za poređenje. Pokrenite novu simulaciju.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="card">
          <div className="card__header">
            <h2 className="card__title">
              <History size={20} className="card__title-icon" />
              Istorija performance izveštaja
            </h2>
            <span className="text-muted">Prikazano: {reports.length}</span>
          </div>
          <div className="card__body">
            <PerformanceReportsTable
              reports={reports}
              onExport={(id) => void handleExportPDF(id)}
              onViewDetails={(report) => {
                setSelectedReport(report);
                setActiveTab("compare");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformancePage;




