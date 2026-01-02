import React, {useState, useEffect} from "react";
import { BarChart3, FileText, TrendingUp, Package, Download, Calendar, Filter, RefreshCw, DollarSign, ShoppingBag, TrendingDown, TrendingUp as TrendingUpIcon, PieChart } from "lucide-react";
import { useAuth } from "../hooks/useAuthHook";
import { useServices } from "../contexts/ServiceContext";
import { FiscalBillDTO } from "../models/analysis/FiscalBillDTO";
import { SalesReportDTO } from "../models/analysis/SalesReportDTO";
import { TopProductReportDTO } from "../models/analysis/TopProductReportDTO";
import { TrendAnalysisDTO } from "../models/analysis/TrendAnalysisDTO";
import FiscalBillsTable from '../components/analysis/FiscalBillsTable'
import SalesAnalysisChart from "../components/analysis/SalesAnalysisChart";
import TopProductsTable from "../components/analysis/TopProductsTable";
import TrendAnalysisCard from "../components/analysis/TrendAnalysisCard";
import GenerateReportModel from "../components/analysis/GenerateReportModel";
import { formatCurrency, formatDate } from "../helpers/formatters";

export const AnalysisPage: React.FC = () => {
    const {token} = useAuth();
    const {analysisAPI} = useServices();

    const [activeTab, setActiveTab] = useState<'overview' | 'fiscal' | 'sales' | 'products' | 'trends'>('overview');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    //podaci
    const [fiscalBills, setFiscalBills] = useState<FiscalBillDTO[]>([]);
    const [salesReports, setSalesReports] = useState<SalesReportDTO[]>([]);
    const [topProductsReports, setTopProductsReports] = useState<TopProductReportDTO[]>([]);
    const [trendAnalyses, setTrendAnalyses] = useState<TrendAnalysisDTO[]>([]);

    //filteri
    const [period, setPeriod] = useState<string>('this-month');
    const [dateRange, setDateRange] = useState<{start: Date | null; end: Date | null}>({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        end: new Date()
    });

    //modeli
    const [isGenerateReportModelOpen, setIsGenerateReportModelOpen] = useState(false);
    const [reportType, setReportType] = useState<'sales' | 'products' | 'trends'>('sales');

    //ucitavanje podataka
    const loadData = async () => {
        if(!token) return;

        setIsLoading(true);
        setError(null);

        try{
            const [bills, sales, topProducts, trends] = await Promise.all([
                analysisAPI.getFiscalBills(token, period),
                analysisAPI.getSalesReports(token),
                analysisAPI.getTopProductsReports(token),
                analysisAPI.getTrendAnalyses(token)
            ]);

            setFiscalBills(bills);
            setSalesReports(sales);
            setTopProductsReports(topProducts);
            setTrendAnalyses(trends);
        }catch(err){
            setError('Greška pri učitavanju podataka za analizu');
            console.error(err);
        }finally{
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [token, period]);

    //racunanje statistika za pregled
    const calculateOverviewStats = () => {
        const totalRevenue = fiscalBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
        const totalProductsSold = fiscalBills.reduce((sum, bill) => sum + bill.soldItems.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
        const averageBillValue = fiscalBills.length > 0 ? totalRevenue / fiscalBills.length : 0;

        //racunanje dnevnog trenda
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const todayRevenue = fiscalBills.filter(bill => bill.createdAt.split('T')[0] === today).reduce((sum, bill) => sum + bill.totalAmount, 0);

        const yesterdayRevenue = fiscalBills.filter(bill => bill.createdAt.split('T')[0] === yesterdayStr).reduce((sum, bill) => sum + bill.totalAmount, 0);

        const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
        
        return {
            totalRevenue,
            totalProductsSold,
            averageBillValue,
            todayRevenue,
            revenueChange,
            totalBills: fiscalBills.length
        };
    };

    const stats = calculateOverviewStats();

    //f-ja za eksport PDF-a
    const handleExportPDF = async (id: string, type: 'sales' | 'products' | 'trends' | 'fiscal') => {
        if(!token) return;

        try{
            let blob: Blob;
            switch(type){
                case 'fiscal':
                    blob = await analysisAPI.exportFiscalBillPDF(id, token);
                    break;
                case 'sales':
                    blob = await analysisAPI.exportSalesReportPDF(id, token);
                    break;
                case 'products':
                    blob = await analysisAPI.exportTopProductsPDF(id, token);
                    break;
                case 'trends':
                    blob = await analysisAPI.exportTrendAnalysisPDF(id, token);
                    break;
                default:
                    return;
            }
            //kreiranje linka za download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}-report-${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }catch(err){
            console.error('Greška pri eksportu PDF-a:', err);
        }
    };

    //generisanje izvjestaja
    const handleGenerateReport = async (params: any) => {
        if(!token) return;
        try{
            setIsLoading(true);
            switch(reportType){
                case 'sales':
                    await analysisAPI.generateSalesAnalysis(params, token);
                    break;
                case 'products':
                    await analysisAPI.generateTopProductsAnalysis(params, token);
                    break;
                case 'trends':
                    await analysisAPI.generateTrendAnalysis(params, token);
                    break;
            }
            await loadData();
            setIsGenerateReportModelOpen(false);
        }catch(err){
            setError('Greška pri generisanju izveštaja.');
            console.error(err);
        }finally{
            setIsLoading(false);
        }
    };

    return(
        <div className="analysis-page">
            <div className="page-header">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="page-header__title">Analiza prodaje</h1>
                        <p className="page-header__subtitle">Pregled performansi prodaje i finansijskih izveštaja</p>
                    </div>
                    <div className="flex items-center gap-md">
                        <div className="flex items-center gap-sm bg-white rounded-1g p-2 border border-border">
                            <Calendar size={16}/>
                            <select className="select border-0 bg-transparent p1-2" value={period} onChange={(e) => setPeriod(e.target.value)}>
                                <option value="today">Danas</option>
                                <option value="yesterday">Juče</option>
                                <option value="this-week">Ova nedelja</option>
                                <option value="this-month">Ovaj mesec</option>
                                <option value="last-mobth">Prošli mesec</option>
                                <option value="this-year">Ova godina</option>
                                <option value="all">Sve</option>
                            </select>
                        </div>
                        <button className="btn btn--outline"
                        onClick={() => setIsGenerateReportModelOpen(true)}>
                            <FileText size={16}/>
                            Generiši izveštaj
                        </button>
                        <button className="btn btn--secondary"
                        onClick={loadData}
                        disabled={isLoading}>
                            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''}/>
                            Osveži
                        </button>
                    </div>
                </div>
            </div>
            {error && (
                <div className="card mb-lg border-error bg-red-50">
                    <div className="card__body">
                        <div className="flex items-center gap-md">
                            <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                                <TrendingDown className="text-error" size={20}/>
                            </div>
                            <div>
                                <p className="text-error font-medium">
                                    {error}
                                </p>
                                <button className="btn btn--ghost btn--sm mt-2"
                                onClick={loadData}>
                                    Pokušaj ponovo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="card mb-lg">
                <div className="card__body p-2">
                    <div className="flex gap-1">
                        <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'}`}
                        onClick={() => setActiveTab('overview')}>
                            <BarChart3 size={16} className="inline mr-2"/>
                            Pregled
                        </button>
                        <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'fiscal' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'}`}
                        onClick={() => setActiveTab('fiscal')}>
                            <FileText size={16} className="inline mr-2"/>
                            Fiskalni računi 
                        </button>
                        <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'sales' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'}`}
                        onClick={() => setActiveTab('sales')}>
                            <DollarSign size={16} className="inline mr-2"/>
                            Prodaja 
                        </button>
                        <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'}`}
                        onClick={() => setActiveTab('products')}>
                            <Package size={16} className="inline mr-2"/>
                            Top proizvodi 
                        </button>
                        <button className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'trends' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-surface'}`}
                        onClick={() => setActiveTab('trends')}>
                            <TrendingUp size={16} className="inline mr-2"/>
                            Trendovi 
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md mb-lg">
                            <div className="card">
                                <div className="card__body">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-text-muted">
                                                Ukupna zarada
                                            </p>
                                            <p className="text-2x1 font-bold mt-1">
                                                {formatCurrency(stats.totalRevenue)}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <DollarSign className="text-primary" size={24}/>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center">
                                        <span className={`text-sm font-medium ${stats.revenueChange >= 0 ? 'text-success' : 'text-error'}`}>
                                            {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange.toFixed(1)}%
                                        </span>
                                        <span className="text-sm text-text-muted ml-2">
                                            Od juče
                                        </span>
                                    </div>  
                                </div>
                            </div>

                            <div className="card">
                                <div className="card__body">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-text-muted">
                                                Prodatih parfema
                                            </p>
                                            <p className="text-2x1 font-bold mt-1">
                                                {stats.totalProductsSold.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <ShoppingBag className="text-primary" size={24}/>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-sm text-text-muted">
                                            {stats.totalBills} fiskalnih računa
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card__body">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-text-muted">
                                                Prosečni računi
                                            </p>
                                            <p className="text-2x1 font-bold mt-1">
                                                {formatCurrency(stats.averageBillValue)}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <PieChart className="text-primary" size={24}/>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-sm text-text-muted">
                                            Dnevno: {formatCurrency(stats.todayRevenue)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/*Grafikoni */}
                        <div className="card">
                            <div className="card__header">
                                <h3 className="card__title">
                                    Dnevna prodaja
                                </h3>
                            </div>
                            <div className="card__body">
                                <SalesAnalysisChart salesReports={salesReports}
                                height={300}/>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-lg">
                        <div className="card">
                            <div className="card__header">
                                <h3 className="card__title">
                                    Top proizvodi
                                </h3>
                            </div>
                            <div className="card__body p-0">
                                {topProductsReports.length > 0 ? (
                                    <TopProductsTable 
                                        products={topProductsReports[0]?.topProducts.slice(0, 5) || []}
                                        compact={true}
                                    />
                                    ) : (
                                    <div className="p-6 text-center">
                                        <p className="text-text-muted">Nema podataka o top proizvodima</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card">
                            <div className="card__header">
                                <h3 className="card__title">
                                    Najnoviji trendovi
                                </h3>
                            </div>
                            <div className="card__body space-y-md">
                                {trendAnalyses.slice(0, 2).map((trend) => (
                                    <TrendAnalysisCard key={trend.id}
                                    analysis={trend}
                                    onExport={() => handleExportPDF(trend.id, 'trends')}
                                    compact={true}/>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'fiscal' && (
                <div className="card">
                    <div className="card__header">
                        <h3 className="card__title">
                            Fiskalni računi
                        </h3>
                        <div className="flex items-center gap-sm">
                            <span className="text-sm text-text-muted">
                                Prikazano {fiscalBills.length} računa
                            </span>
                            <button className="btn btn--outline btn--sm"
                            onClick={() => {/*kreiranje novog racuna */}}>
                                + Novi račun
                            </button>
                        </div>
                    </div>
                    <div className="card__body">
                        <FiscalBillsTable
                        bills={fiscalBills}
                        onExport={handleExportPDF}
                        isLoading={isLoading}/>
                    </div>
                </div>
            )}
            {activeTab === 'sales' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-1g">
                    <div className="lg:col-span-2">
                        <div className="card">
                            <div className="card__header">
                                <h3 className="card__title">
                                    Izveštaji prodaje
                                </h3>
                            </div>
                            <div className="card__body">
                                {salesReports.length > 0 ? (
                                    <div className="space-y-md">
                                        {salesReports.map((report) => (
                                            <div key={report.id} className="border border-border rounden-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-medium">
                                                            {report.periodType === 'daily' && 'Dnevni izveštaj'}
                                                            {report.periodType === 'weekly' && 'Nedeljni izveštaj'}
                                                            {report.periodType === 'monthly' && 'Mesečni izveštaj'}
                                                            {report.periodType === 'yearly' && 'Godišnji izveštaj'}
                                                            {report.periodType === 'total' && 'Ukupni izveštaj'}
                                                        </h4>
                                                        <p className="text-sm text-text-muted">
                                                            Period: {report.periodValue} | Generisano: {formatDate(report.generatedAt)}
                                                        </p>
                                                    </div>
                                                    <button className="btn btn--outline btn--sm"
                                                    onClick={() => handleExportPDF(report.id, 'sales')}>
                                                        <Download size={14}/>
                                                        PDF
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div>
                                                        <p className="text-sm text-text-muted">
                                                            Ukupna zarada
                                                        </p>
                                                        <p className="text-lg font-bold"> 
                                                            {formatCurrency(report.revenue)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-text-muted">
                                                            Prodatih jedinica
                                                        </p>
                                                        <p className="text-lg font-bold">
                                                            {report.totalUnitsSold.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-text-muted">
                                                            Prosečna vrednost
                                                        </p>
                                                        <p className="text-lg font-bold">
                                                            {report.totalUnitsSold > 0 ? formatCurrency(report.revenue / report.totalUnitsSold) : formatCurrency(0)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-text-muted">
                                            Nema generisanih izveštaja prodaje
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="card">
                            <div className="card__header">
                                <h3 className="card__title">
                                    Filteri
                                </h3>
                            </div>
                            <div className="card__body">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-2">
                                            Tip perioda
                                        </label>
                                        <select className="w-full input">
                                            <option value="daily">Dnevni</option>
                                            <option value="weekly">Nedeljni</option>
                                            <option value="monthly">Mesečni</option>
                                            <option value="yearly">Godišnji</option>
                                            <option value="total">Ukupno</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-2"> 
                                            Datum od
                                        </label>
                                        <input type="date" className="w-full input"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-2">
                                            Datum do
                                        </label>
                                        <input type="date" className="w-full input" />
                                    </div>
                                    <button className="w-full btn btn--primary">
                                        <Filter size={16} className="mr-2" />
                                        Primeri filter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'products' && (
                <div className="card">
                    <div className="card__header">
                        <h3 className="card__title">Top proizvodi</h3>
                    </div>
                    <div className="card__body">
                        {topProductsReports.length > 0 ? (
                            <TopProductsTable
                            products={topProductsReports[0]?.topProducts || []}
                            onExport={() => topProductsReports[0] && handleExportPDF(topProductsReports[0].id, 'products')}/>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-text-muted">Nema podataka o top proizvodima</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {activeTab === 'trends' && (
                <div className="grid grid-cols-1 1g:grid-cols-2 gap-1g">
                    {trendAnalyses.map((analysis) => (
                        <TrendAnalysisCard
                        key={analysis.id}
                        analysis={analysis}
                        onExport={() => handleExportPDF(analysis.id, 'trends')}/>
                    ))}
                    {trendAnalyses.length === 0 && (
                        <div className="col-span-2 text-center py-12">
                            <p className="text-text-muted">Nema generisanih analiza trendova</p>
                        </div>
                    )}
                </div>
            )}
            {/*model za generisanje izvjestaja */}
            <GenerateReportModel
            isOpen={isGenerateReportModelOpen}
            onClose={() => setIsGenerateReportModelOpen(false)}
            onGenerate={handleGenerateReport}
            reportType={reportType}
            setReportType={setReportType}
            isLoading={isLoading}/>
        </div>
    );
};

export default AnalysisPage;
