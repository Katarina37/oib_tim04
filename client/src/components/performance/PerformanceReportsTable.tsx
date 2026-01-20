import React from "react";
import { Download, BarChart2, Activity } from "lucide-react";
import { PerformanceReportDTO } from "../../models/performance/PerformanceReportDTO";

interface PerformanceReportsTableProps {
    reports: PerformanceReportDTO[];
    onExport?: (id: number) => void;
    onViewDetails?: (report: PerformanceReportDTO) => void;
}

const PerformanceReportsTable: React.FC<PerformanceReportsTableProps> = ({
    reports,
    onExport,
    onViewDetails
}) => {
    if (reports.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-text-muted">Nema podataka o simulacijama performansi</p>
            </div>
        );
    }

    return (
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex justify-between items-center">
                <h4 className="font-medium flex items-center gap-2">
                    <Activity size={18} className="text-primary" />
                    Istorija performansi logističkih algoritama
                </h4>
            </div>

            <div className="p-4">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border text-left">
                            <th className="pb-2 text-sm text-text-muted font-medium">Naziv / Tip</th>
                            <th className="pb-2 text-sm text-text-muted font-medium text-center">Vreme</th>
                            <th className="pb-2 text-sm text-text-muted font-medium text-center">Brzina</th>
                            <th className="pb-2 text-sm text-text-muted font-medium">Efikasnost</th>
                            <th className="pb-2 text-sm text-text-muted font-medium text-right">Akcije</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((report) => (
                            <tr key={report.id} className="border-b border-border last:border-0 hover:bg-background/50 transition-colors">
                                <td className="py-3">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{report.naziv}</span>
                                        <span className="text-xs text-text-muted uppercase tracking-wider">
                                            {report.tip_algoritma.replace('_', ' ')}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-3 text-sm text-center">
                                    {report.vreme_obrade_sekunde.toFixed(2)}s
                                </td>
                                <td className="py-3 text-sm text-center">
                                    {report.brzina_obrade} amb/s
                                </td>
                                <td className="py-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 h-2 bg-border rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${report.efikasnost_procenat > 80 ? 'bg-success' : 'bg-primary'}`}
                                                style={{ width: `${Math.min(report.efikasnost_procenat, 100)}%` }}
                                            />
                                        </div>
                                        <span className="text-text-muted text-xs">
                                            {report.efikasnost_procenat}%
                                        </span>
                                    </div>
                                </td>
                                <td className="py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        {onViewDetails && (
                                            <button 
                                                className="p-1.5 hover:bg-border rounded text-text-secondary"
                                                onClick={() => onViewDetails(report)}
                                                title="Detalji"
                                            >
                                                <BarChart2 size={16} />
                                            </button>
                                        )}
                                        {onExport && (
                                            <button 
                                                className="p-1.5 hover:bg-border rounded text-primary"
                                                onClick={() => onExport(report.id)}
                                                title="Preuzmi PDF"
                                            >
                                                <Download size={16} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-4 py-3 border-t border-border bg-surface/50">
                <span className="text-xs text-text-muted uppercase font-semibold">
                    Ukupno zabeleženih simulacija: {reports.length}
                </span>
            </div>
        </div>
    );
};

export default PerformanceReportsTable;
