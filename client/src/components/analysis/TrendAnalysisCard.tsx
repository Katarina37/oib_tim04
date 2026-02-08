import React from "react";
import { BarChart3, Download, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { TrendAnalysisDTO } from "../../models/analysis/TrendAnalysisDTO";
import { formatDate } from "../../helpers/formatters";

interface TrendAnalysisCardProps {
  analysis: TrendAnalysisDTO;
  onExport: () => void;
  compact?: boolean;
}

const TrendAnalysisCard: React.FC<TrendAnalysisCardProps> = ({
  analysis,
  onExport,
  compact = false,
}) => {
  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case "monthly_trend":
        return "Mesečni trend";
      case "product_trend":
        return "Trend po proizvodu";
      case "category_trend":
        return "Trend po kategoriji";
      default:
        return type;
    }
  };

  const getChangePercent = () => {
    if (analysis.dataPoints.length < 2) {
      return 0;
    }

    const first = analysis.dataPoints[0].value;
    const last = analysis.dataPoints[analysis.dataPoints.length - 1].value;

    if (first === 0) {
      return last > 0 ? 100 : 0;
    }

    return ((last - first) / first) * 100;
  };

  const getTrendIcon = () => {
    const change = getChangePercent();
    if (analysis.dataPoints.length < 2) {
      return <Minus size={16} />;
    }

    if (change > 5) {
      return <TrendingUp size={16} className="text-success" />;
    }

    if (change < -5) {
      return <TrendingDown size={16} className="text-error" />;
    }

    return <Minus size={16} />;
  };

  const chartData = analysis.dataPoints.map((point) => ({
    label: point.label,
    value: point.value,
  }));

  const lineColor = analysis.id % 2 === 0 ? "var(--color-warning)" : "var(--color-info)";
  const changePercent = getChangePercent();

  return (
    <div className={`card analysis-trend-card ${compact ? "analysis-trend-card--compact" : ""}`}>
      <div className="card__header">
        <h4 className="card__title">
          <BarChart3 size={18} className="card__title-icon" />
          {getAnalysisTypeLabel(analysis.analysisType)}
        </h4>
        <button className="btn btn--outline btn--sm btn--pdf" onClick={onExport}>
          <Download size={14} />
          PDF
        </button>
      </div>
      <div className="card__body">
        <p className="text-muted">Generisano: {formatDate(analysis.generatedAt)}</p>

        {!compact && chartData.length > 1 && (
          <div className="analysis-trend-card__chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e9ec" />
                <XAxis dataKey="label" stroke="#8a9bac" fontSize={10} />
                <YAxis stroke="#8a9bac" fontSize={10} />
                <Line type="monotone" dataKey="value" stroke={lineColor} strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="analysis-trend-card__conclusion">
          {getTrendIcon()}
          <span>{analysis.conclusion ?? "Nema zakljucka"}</span>
        </div>

        <div className="analysis-trend-card__meta">
          <span className="text-muted">Broj tacaka: {analysis.dataPoints.length}</span>
          <span className={changePercent >= 0 ? "text-success" : "text-error"}>
            {changePercent >= 0 ? "+" : ""}
            {changePercent.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysisCard;
