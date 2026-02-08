import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SalesReportDTO } from "../../models/analysis/SalesReportDTO";
import { formatCurrency } from "../../helpers/formatters";

interface SalesAnalysisChartProps {
  salesReports: SalesReportDTO[];
  height?: number;
}

const SalesAnalysisChart: React.FC<SalesAnalysisChartProps> = ({ salesReports, height = 300 }) => {
  const resolveChartSource = (): SalesReportDTO[] => {
    const priority: Array<SalesReportDTO["periodType"]> = ["daily", "weekly", "monthly", "yearly"];
    for (const periodType of priority) {
      const matches = salesReports.filter((report) => report.periodType === periodType);
      if (matches.length > 0) {
        return matches;
      }
    }
    return [];
  };

  const chartSource = resolveChartSource();
  const chartData = [...chartSource]
    .sort((first, second) => first.periodValue.localeCompare(second.periodValue))
    .slice(-8)
    .map((report) => ({
      label: report.periodValue,
      revenue: report.revenue,
      units: report.totalUnitsSold,
    }));

  if (chartData.length === 0) {
    return (
      <div className="empty-state" style={{ minHeight: `${height}px` }}>
        <p className="text-muted">Nema podataka za prikaz grafikona.</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    return (
      <div className="analysis-chart-tooltip">
        <p className="font-medium">{label}</p>
        <p className="text-success">Zarada: {formatCurrency(payload[0].value)}</p>
        <p className="text-muted">Prodate jedinice: {payload[0].payload.units}</p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e9ec" />
        <XAxis dataKey="label" stroke="#8a9bac" fontSize={12} />
        <YAxis
          stroke="#8a9bac"
          fontSize={12}
          tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="revenue" fill="#66cdaa" radius={[6, 6, 0, 0]} name="Zarada" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SalesAnalysisChart;
