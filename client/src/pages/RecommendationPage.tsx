import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw, Star } from "lucide-react";
import { useAuth } from "../hooks/useAuthHook";
import { useServices } from "../contexts/ServiceContext";
import { UserRecommendationDTO } from "../models/recommendation/RecommendationDTO";
import { formatDate } from "../helpers/formatters";
import RecommendationCard from "../components/recommendation/RecommendationCard";

const RecommendationPage: React.FC = () => {
    const { token, user } = useAuth();
    const { recommendationAPI } = useServices();

    const [recommendations, setRecommendations] = useState<UserRecommendationDTO | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadRecommendations = useCallback(async (refresh = false) => {
        if (!token || !user?.id) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await recommendationAPI.getRecommendations(
                user.id,
                token,
                10,
                refresh
            );
            setRecommendations(data);
        } catch {
            setError("Greška pri učitavanju preporuka.");
        } finally {
            setIsLoading(false);
        }
    }, [token, user?.id, recommendationAPI]);

    useEffect(() => {
        void loadRecommendations();
    }, [loadRecommendations]);

    return (
        <div className="analysis-page">
            <div className="page-header page-header--with-action">
                <div>
                    <h1 className="page-header__title">Preporuke parfema</h1>
                    <p className="page-header__subtitle">
                        Personalizovane preporuke na osnovu popularnosti i obrazaca kupovine
                    </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        className="btn btn--secondary"
                        onClick={() => void loadRecommendations(true)}
                        disabled={isLoading}
                    >
                        <RefreshCw size={16} className={isLoading ? "icon-spin" : ""} />
                        {isLoading ? "Učitavanje..." : "Osvježi preporuke"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="storage-alert storage-alert--error">{error}</div>
            )}

            {recommendations && (
                <p className="text-muted" style={{ fontSize: "0.875rem" }}>
                    Generisano: {formatDate(recommendations.generisanDatum.toString())}
                </p>
            )}

            <div className="card">
                <div className="card__header">
                    <h2 className="card__title">
                        <Star size={20} className="card__title-icon" />
                        Preporučeni parfemi
                    </h2>
                    <span className="text-muted">
                        {recommendations?.preporuke.length ?? 0} preporuka
                    </span>
                </div>
                <div className="card__body">
                    {isLoading && (
                        <div className="empty-state">
                            <div className="spinner" />
                        </div>
                    )}
                    {!isLoading && recommendations?.preporuke.length === 0 && (
                        <div className="empty-state">
                            <p className="text-muted">Nema dostupnih preporuka.</p>
                        </div>
                    )}
                    {!isLoading && recommendations && recommendations.preporuke.length > 0 && (
                        <div className="recommendation-list">
                            {recommendations.preporuke.map((rec) => (
                                <RecommendationCard
                                    key={rec.parfemId}
                                    recommendation={rec}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecommendationPage;