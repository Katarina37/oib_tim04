import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { PerformanceReportDTO } from "../../models/performance/PerformanceReportDTO";

interface ChartDatum {
  name: string;
  efficiency: number;
  speed: number;
  algorithm: "distributivni_centar" | "magacinski_centar";
}

interface EfficiencyComparisonChartProps {
  reports: PerformanceReportDTO[];
  height?: number;
}

const getAlgorithmMeta = (
  algorithm: ChartDatum["algorithm"]
): { label: string; badgeClassName: string } => {
  if (algorithm === "distributivni_centar") {
    return {
      label: "Distributivni centar",
      badgeClassName: "badge--performance-distribution",
    };
  }

  return {
    label: "Magacinski centar",
    badgeClassName: "badge--performance-warehouse",
  };
};

const EfficiencyComparisonChart: React.FC<EfficiencyComparisonChartProps> = ({ reports, height = 300 }) => {
  const chartData: ChartDatum[] = reports.slice(0, 8).reverse().map((report) => ({
    name: report.naziv,
    efficiency: report.efikasnost_procenat,
    speed: report.brzina_obrade,
    algorithm: report.tip_algoritma,
  }));

  if (chartData.length === 0) {
    return (
      <div className="performance-chart performance-chart--empty" style={{ height }}>
        <p className="text-muted">Nema dostupnih podataka za poređenje efikasnosti.</p>
      </div>
    );
  }

  const renderTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: ReadonlyArray<{ payload: ChartDatum; value: number }>;
  }): React.ReactNode => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    const datum = payload[0].payload;
    const algorithm = getAlgorithmMeta(datum.algorithm);
    return (
      <div className="performance-chart__tooltip">
        <p className="font-medium">{datum.name}</p>
        <p>Efikasnost: {datum.efficiency.toFixed(2)}%</p>
        <p>Brzina: {datum.speed.toFixed(3)} amb/s</p>
        <p>Algoritam: <span className={`badge ${algorithm.badgeClassName}`}>{algorithm.label}</span></p>
      </div>
    );
  };

  return (
    <div className="performance-chart">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e9ec" vertical={false} />
          <XAxis dataKey="name" fontSize={11} stroke="#8a9bac" tickLine={false} axisLine={false} />
          <YAxis
            fontSize={11}
            stroke="#8a9bac"
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            unit="%"
          />
          <Tooltip content={renderTooltip} />
          <Bar dataKey="efficiency" radius={[6, 6, 0, 0]} barSize={34}>
            {chartData.map((entry, index) => (
              <Cell
                key={`performance-cell-${index}`}
                fill={
                  entry.algorithm === "distributivni_centar"
                    ? "var(--color-primary-dark)"
                    : "var(--color-info)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EfficiencyComparisonChart;
