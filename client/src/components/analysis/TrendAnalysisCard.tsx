import React from "react";
import { TrendingUp, TrendingDown, Minus, Download, BarChart3 } from "lucide-react";
import { TrendAnalysisDTO } from "../../models/analysis/TrendAnalysisDTO";
import { formatDate } from "../../helpers/formatters";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer} from 'recharts';

interface TrendAnalysisCardProps{
    analysis: TrendAnalysisDTO;
    onExport: () => void;
    compact?: boolean;
}

const TrendAnalysisCard: React.FC<TrendAnalysisCardProps> = ({
    analysis, 
    onExport,
    compact = false
}) => {
    const getAnalysisTypeLabel = (type: string) => {
        switch(type) {
            case 'monthly_trend': return 'Mesečni trend';
            case 'product_trend': return 'Trend po proizvodu';
            case 'category_trend': return 'Trend po kategoriji';
            default: return type;
        }
    };

    const getTrendIcon = () => {
        if(analysis.dataPoints.length < 2){
            return <Minus size={16}/>;
        }

        const first = analysis.dataPoints[0].value;
        const last = analysis.dataPoints[analysis.dataPoints.length - 1].value;
        const change = ((last - first) / first) * 100;

        if(change > 5){
            return <TrendingUp size={16} className="text-success"/>;
        }else if(change < -5){
            return <TrendingDown size={16} className="text-error"/>;
        }
        return <Minus size={16}/>;
    };

    const prepareCharData = () => {
        return analysis.dataPoints.map((point, index) => ({
            name: point.label,
            value: point.value,
            index
        }));
    };

    const charData = prepareCharData();

    return(
        <div className={`card ${compact ? '' : 'h-full'}`}>
            <div className="card__header">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                            <BarChart3 size={16} className="text-primary"/>
                        </div>
                        <div>
                            <h4 className="font-medium">
                                {getAnalysisTypeLabel(analysis.analysisType)}
                            </h4>
                            <p className="text-xs text-text-muted">
                                Generisano: {formatDate(analysis.generatedAt)}
                            </p>
                        </div>
                    </div>
                    <button className="btn btn--ghost btn--icon btn--sm" onClick={onExport} title="Preuzmi PDF">
                        <Download size={14}/>
                    </button>
                </div>
            </div>
            <div className="card__body">
                {!compact && charData.length > 1 && (
                    <div className="mb-4" style={{height: '150px'}}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={charData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e9ec"/>
                                <XAxis
                                dataKey="name"
                                stroke="#8a9bac"
                                fontSize={10}/>
                                <YAxis
                                stroke="#8a9bac"
                                fontSize={10}/>
                                <Line
                                type="monotone"
                                dataKey="value"
                                stroke="#66cdaa"
                                strokeWidth={2}
                                dot={{r : 3}}
                                activeDot={{r : 5}}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                    {getTrendIcon()}
                    <span className="text-sm font-medium">
                        {analysis.conclusion || 'Nema zaključka'}
                    </span>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-text-muted">
                            Period analize:
                        </span>
                        <span className="font-medium">
                            {analysis.dataPoints.length > 0 ? `${analysis.dataPoints[0].label} - ${analysis.dataPoints[analysis.dataPoints.length - 1].label}` : 'N/A'}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-text-muted">
                            Broj tačaka:
                        </span>
                        <span className="font-medium">
                            {analysis.dataPoints.length}
                        </span>
                    </div>
                    {analysis.dataPoints.length > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-text-muted">
                                Promena:
                            </span>
                            <span className={`font-medium ${analysis.dataPoints[analysis.dataPoints.length - 1].value > analysis.dataPoints[0].value ? 'text-success' : 'text-error'}`}>
                                {analysis.dataPoints.length > 1 ? `${(((analysis.dataPoints[analysis.dataPoints.length - 1].value - analysis.dataPoints[0].value) / analysis.dataPoints[0].value) * 100).toFixed(1)}%` : '0%'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrendAnalysisCard;