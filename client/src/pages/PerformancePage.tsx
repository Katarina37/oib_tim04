import React, { useState, useEffect} from "react";
import { BarChart3, Play, RefreshCw, AlertTriangle, Zap, History, Info } from "lucide-react";
import { useAuth } from "../hooks/useAuthHook";
import { useServices } from "../contexts/ServiceContext";

import { PerformanceReportDTO } from "../models/performance/PerformanceReportDTO";
import PerformanceSimulationForm from "../components/performance/PerformanceSimulationForm";
import PerformanceReportsTable from "../components/performance/PerformanceReportsTable";
import EfficiencyComparisonChart from "../components/performance/EfficiencyComparisonChart";
import AlgorithmAnalysisConclusions from "../components/performance/AlgorithmAnalysisConclusions";

const PerformancePage: React.FC = () => {
    const { token } = useAuth();
    const { performanceAPI } = useServices(); // Pretpostavka da je registrovan u ServiceContext

    const [activeTab, setActiveTab] = useState<'new' | 'history' | 'charts'>('new');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    //podaci
    const [reports, setReports] = useState<PerformanceReportDTO[]>([]);
    const [selectedReport, setSelectedReport] = useState<PerformanceReportDTO | null>(null);

    //ucitavanje prethodnih simulacija
    const loadReports = async () => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await performanceAPI.getReports(token);
            setReports(data);
            if (data.length > 0 && !selectedReport) {
                setSelectedReport(data[0]);
            }
        } catch (err) {
            setError("Greška pri učitavanju istorije performansi.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, [token]);

    //pokretanje nove simulacije
    const handleRunSimulation = async (params: any) => {
        if (!token) return;
        setIsLoading(true);
        setError(null);
        try {
            const newReport = await performanceAPI.runSimulation(params, token);
            setReports(prev => [newReport, ...prev]);
            setSelectedReport(newReport);
            setActiveTab('charts'); // Automatski prebaci na grafikon nakon simulacije
        } catch (err) {
            setError("Neuspešno pokretanje simulacije. Proverite parametre.");
        } finally {
            setIsLoading(false);
        }
    };

    //pdf
    const handleExportPDF = async (id: number) => {
        if (!token) return;
        try {
            const blob = await performanceAPI.exportPerformancePDF(id, token);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            const report = reports.find(r => r.id === id);
            
            a.href = url;
            a.download = `Performance_Report_${report?.naziv || id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Greška pri generisanju PDF-a", err);
        }
    };

    return (
        <div className="analysis-page">
            <div className="page-header">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="page-header__title">Analiza Performansi</h1>
                        <p className="page-header__subtitle">Simulacija i poređenje efikasnosti algoritama</p>
                    </div>
                    <div className="flex items-center gap-md">
                        <button className="btn btn--secondary" onClick={loadReports} disabled={isLoading}>
                            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                            Osveži podatke
                        </button>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="card mb-lg border-error bg-red-50">
                    <div className="card__body flex items-center gap-md">
                        <AlertTriangle className="text-error" size={24} />
                        <p className="text-error font-medium">{error}</p>
                    </div>
                </div>
            )}

            {/* Tab navigacija */}
            <div className="card mb-lg">
                <div className="card__body p-2">
                    <div className="flex gap-sm bg-surface p-1 rounded-lg">
                        <button 
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition
                            ${activeTab === 'new' ? 'bg-white shadow-sm text-primary' : 'text-text-secondary hover:bg-white/60'}`}
                            onClick={() => setActiveTab('new')}
                        >
                            <Play size={16} /> Nova Simulacija
                        </button>
                        <button 
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition
                            ${activeTab === 'charts' ? 'bg-white shadow-sm text-primary' : 'text-text-secondary hover:bg-white/60'}`}
                            onClick={() => setActiveTab('charts')}
                        >
                            <BarChart3 size={16} /> Rezultati i Grafikoni
                        </button>
                        <button 
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition
                            ${activeTab === 'history' ? 'bg-white shadow-sm text-primary' : 'text-text-secondary hover:bg-white/60'}`}
                            onClick={() => setActiveTab('history')}
                        >
                            <History size={16} /> Istorija Izveštaja
                        </button>
                    </div>
                </div>
            </div>

            {/* sadrzaj tabova */}
            <div className="grid grid-cols-1 gap-lg">
                
                {/* tab 1 - nova simulacija */}
                {activeTab === 'new' && (
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="card">
                            <div className="card__header">
                                <h3 className="card__title flex items-center gap-2">
                                    <Zap className="text-primary" size={20} /> Parametri Simulacije
                                </h3>
                            </div>
                            <div className="card__body">
                                <PerformanceSimulationForm onRunSimulation={handleRunSimulation} isLoading={isLoading} />
                            </div>
                        </div>
                    </div>
                )}

                {/* tab2 - grafikoni i analiza */}
                {activeTab === 'charts' && (
                    <div className="space-y-lg">
                        {selectedReport ? (
                            <>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                                    <div className="lg:col-span-2">
                                        <div className="card">
                                            <div className="card__header">
                                                <h3 className="card__title">Vizuelizacija Vremenske Kompleksnosti</h3>
                                            </div>
                                            <div className="card__body">
                                                <EfficiencyComparisonChart reports={reports} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-1">
                                        <AlgorithmAnalysisConclusions selectedReport={selectedReport} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="card p-12 text-center">
                                <Info size={48} className="mx-auto text-text-muted mb-4" />
                                <p className="text-text-muted">Nema selektovanih podataka. Pokrenite simulaciju ili izaberite izveštaj iz istorije.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* tab 3 - tabela sa istorijom */}
                {activeTab === 'history' && (
                    <div className="card">
                        <div className="card__header flex justify-between items-center">
                            <h3 className="card__title">Prethodne Analize</h3>
                            <span className="text-sm text-text-muted">Ukupno: {reports.length}</span>
                        </div>
                        <div className="card__body">
                            <PerformanceReportsTable 
                                reports={reports} 
                                onExport={handleExportPDF} 
                                onViewDetails={(report: PerformanceReportDTO) => {
                                    setSelectedReport(report);
                                    setActiveTab('charts');
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PerformancePage;




