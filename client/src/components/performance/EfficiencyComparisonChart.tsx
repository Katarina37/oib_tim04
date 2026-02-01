import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PerformanceReportDTO } from "../../models/performance/PerformanceReportDTO";


interface EfficiencyComparisonChartProps {
    reports: PerformanceReportDTO[];
    height?: number;
}

const EfficiencyComparisonChart: React.FC<EfficiencyComparisonChartProps> = ({ reports, height = 300 }) => {
    
    // Priprema podataka
    const prepareData = () => {
        if (!reports || reports.length === 0) return [];
        // Uzimamo poslednjih 7 simulacija
        return reports.slice(-7).map(report => ({
            name: report.naziv,
            efficiency: report.efikasnost_procenat,
            type: report.tip_algoritma,
            speed: report.brzina_obrade
        }));
    };

    const chartData = prepareData();

    // Provera da li ima podataka
    if (chartData.length === 0) {
        return (
            <div className="flex items-center justify-center border border-dashed border-border rounded-lg" style={{ height }}>
                <p className="text-text-muted italic">Nema dostupnih podataka za grafički prikaz performansi</p>
            </div>
        );
    }

    const CustomToolTip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-border rounded-lg shadow-lg">
                    <p className="font-bold text-xs uppercase mb-1">{label}</p>
                    <p className="text-sm text-primary font-medium">
                        Efikasnost: {payload[0].value}%
                    </p>
                    <p className="text-[11px] text-text-muted">
                        Brzina: {data.speed} amb/s
                    </p>
                    <p className="text-[11px] text-text-muted">
                        Tip: {data.type === 'distributivni_centar' ? 'Distributivni' : 'Magacinski'}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-surface p-4 rounded-lg border border-border shadow-sm">
            <h4 className="text-xs font-bold uppercase mb-4 text-text-muted tracking-widest">
                Uporedna analiza efikasnosti algoritama
            </h4>
            <ResponsiveContainer width="100%" height={height}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e9ec" vertical={false} />
                    <XAxis 
                        dataKey="name" 
                        fontSize={10} 
                        stroke="#8a9bac" 
                        tickLine={false} 
                    />
                    <YAxis 
                        fontSize={10} 
                        stroke="#8a9bac" 
                        domain={[0, 100]} 
                        tickLine={false} 
                        unit="%" 
                    />
                    <Tooltip content={<CustomToolTip />} />
                    <Bar dataKey="efficiency" radius={[4, 4, 0, 0]} barSize={30}>
                        {chartData.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                // Plava za distributivni, ljubičasta za magacinski
                                fill={entry.type === 'distributivni_centar' ? '#3b82f6' : '#a855f7'} 
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EfficiencyComparisonChart;
