import React from "react";
import { Star, TrendingUp, Users } from "lucide-react";
import { RecommendationItemDTO } from "../../models/recommendation/RecommendationDTO";

interface RecommendationCardProps {
    recommendation: RecommendationItemDTO;
}

const tipIkona = (tip: string) => {
    switch (tip) {
        case "popularity": return <TrendingUp size={14} />;
        case "collaborative": return <Users size={14} />;
        case "hybrid": return <Star size={14} />;
        default: return null;
    }
};

const tipNaziv = (tip: string) => {
    switch (tip) {
        case "popularity": return "Popularnost";
        case "collaborative": return "Slične kupovine";
        case "hybrid": return "Kombinovano";
        default: return tip;
    }
};

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
    return (
        <div className="recommendation-card">
            <div className="recommendation-card__header">
                <span className="recommendation-card__name">{recommendation.naziv}</span>
                <span className={`badge badge--info recommendation-card__type`}>
                    {tipIkona(recommendation.tipPreporuke)}
                    {tipNaziv(recommendation.tipPreporuke)}
                </span>
            </div>
            {recommendation.objasnjenje && (
                <p className="recommendation-card__explanation text-muted">
                    {recommendation.objasnjenje}
                </p>
            )}
        </div>
    );
};

export default RecommendationCard;