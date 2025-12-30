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
}
