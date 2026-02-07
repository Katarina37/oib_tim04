import React from "react";
import { SalesReportDTO } from "../../models/analysis/SalesReportDTO";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { formatCurrency } from "../../helpers/formatters";

interface SalesAnalysisChartProps{
    salesReports: SalesReportDTO[];
    height?: number;
}

const SalesAnalysisChart: React.FC<SalesAnalysisChartProps> = ({salesReports, height = 300}) => {
    const prepareChartData = () => {
        const dailyReports = salesReports.filter(report => report.periodType === 'daily');

        if(dailyReports.length === 0){
            return [];
        }

        return dailyReports.slice(-7).map(report => ({
            date: report.periodValue,
            revenue: report.revenue,
            units: report.totalUnitsSold
        }));
    };

    const charData = prepareChartData();

    if(charData.length === 0){
        return(
            <div className="flex items-center justify-center" style={{height}}>
                <p className="text-text-muted">Nema podataka za prikaz grafika</p>
            </div>
        );
    }

    const CustomToolTip = ({active, payload, label}: any) => {
        if(active && payload && payload.length){
            return(
                <div className="bg-white p-3 border border-border rounded-lg shadow-lg">
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-primary">
                        Zarada: {formatCurrency(payload[0].value)}
                    </p>
                    <p className="text-sm text-text-muted">
                        Proizvoda: {payload[0].payload.units}
                    </p>
                </div>
            );
        }
        return null;
    };

    return(
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={charData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e9ec"/>
                <XAxis
                dataKey="date"
                stroke="#8a9bac"
                fontSize={12}/>
                <YAxis
                stroke="#8a9bac"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}/>
                <Tooltip content={<CustomToolTip/>}/>
                <Bar
                dataKey="revenue"
                fill="#66cdaa"
                radius={[4, 4, 0, 0]}
                name="Zarada"/>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default SalesAnalysisChart;
