import { IRecommendationService } from "../Domain/services/IRecommendationService";
import { IRecommendationRepository } from "../Domain/services/IRecommendationRepository";
import { ILoggerService } from "../Domain/services/ILoggerService";
import { RecommendationRequestDTO } from "../Domain/DTOs/RecommendationRequestDTO";
import { RecommendationResponseDTO } from "../Domain/DTOs/RecommendationResponse";
import { RecommendationType } from "../Domain/enums/RecommendationType";
import { LogLevel } from "../Domain/enums/LogLevel";

export class RecommendationService implements IRecommendationService {
    constructor(
        private repository: IRecommendationRepository,
        private logger: ILoggerService
    ) {}

    async getRecommendationsForUser(request: RecommendationRequestDTO): Promise<RecommendationResponseDTO> {
        const limit = request.limit || 10;

        if (!request.refresh) {
            const existing = await this.repository.findLatestByUserId(request.korisnikId);
            if (existing && existing.generisanDatum > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
                await this.logger.log(
                    `Returning cached recommendations for user ${request.korisnikId}`,
                    LogLevel.INFO,
                    { userId: request.korisnikId }
                );
                return this.mapToResponse(existing);
            }
        }

        await this.logger.log(
            `Generating recommendations for user ${request.korisnikId}`,
            LogLevel.INFO,
            { userId: request.korisnikId }
        );

        const topPerfumes = await this.repository.getTopSellingPerfumes(10, 30);

        const userPerfumes = await this.repository.getUserPurchasedPerfumes(request.korisnikId);
        const userPerfumeIds = new Set(userPerfumes.map(p => p.parfemId));

        const collaborativeScores = new Map<number, { naziv: string; score: number }>();

        for (const userP of userPerfumes) {
            const related = await this.repository.getCoOccurrenceForPerfume(userP.parfemId, limit);
            for (const rel of related) {
                if (userPerfumeIds.has(rel.parfemId2)) continue;

                const current = collaborativeScores.get(rel.parfemId2);
                collaborativeScores.set(rel.parfemId2, {
                    naziv: current?.naziv ?? "",
                    score: (current?.score ?? 0) + rel.zajednickiBroj
                });
            }
        }

        const topPerfumeMap = new Map(topPerfumes.map(p => [p.id, p.naziv]));
        for (const [id, data] of collaborativeScores.entries()) {
            if (!topPerfumeMap.has(id)) {
                const perfume = await this.repository.getPerfumeById(id);
                data.naziv = perfume?.naziv ?? `Parfem #${id}`;
            } else {
                data.naziv = topPerfumeMap.get(id)!;
            }
        }

        const hybridMap = new Map<number, { naziv: string; score: number; tip: string }>();

        topPerfumes.forEach((p, index) => {
            if (!userPerfumeIds.has(p.id)) {
                const popularityScore = (topPerfumes.length - index) * 10;
                hybridMap.set(p.id, {
                    naziv: p.naziv,
                    score: popularityScore,
                    tip: RecommendationType.POPULARITY
                });
            }
        });

        for (const [id, data] of collaborativeScores.entries()) {
            const existing = hybridMap.get(id);
            if (existing) {
                existing.score += data.score;
                existing.tip = RecommendationType.HYBRID;
            } else {
                hybridMap.set(id, {
                    naziv: data.naziv,
                    score: data.score,
                    tip: RecommendationType.COLLABORATIVE
                });
            }
        }

        const finalRecommendations = Array.from(hybridMap.entries())
            .map(([id, data]) => ({
                parfemId: id,
                naziv: data.naziv,
                tipPreporuke: data.tip,
                score: data.score
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        const saved = await this.repository.createRecommendation({
            korisnikId: request.korisnikId,
            preporuceniParfemi: finalRecommendations.map(r => ({
                parfemId: r.parfemId,
                naziv: r.naziv,
                tipPreporuke: r.tipPreporuke,
                score: r.score
            })),
            tipPreporuke: RecommendationType.HYBRID,
            isticeDatum: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        await this.logger.log(
            `Generated ${finalRecommendations.length} recommendations for user ${request.korisnikId}`,
            LogLevel.INFO,
            { userId: request.korisnikId }
        );

        return this.mapToResponse(saved);
    }

    async updateCollaborativeFilteringData(): Promise<void> {
        await this.logger.log("Starting collaborative filtering data update", LogLevel.INFO);
        await this.logger.log("Collaborative filtering data update completed", LogLevel.INFO);
    }

    async updateCoOccurrence(parfemId1: number, parfemId2: number): Promise<void> {
        await this.repository.updateCoOccurrence(parfemId1, parfemId2);
        await this.logger.log(`Co-occurrence ažuriran: ${parfemId1} <-> ${parfemId2}`, LogLevel.INFO);
    }

    private mapToResponse(rec: {
        korisnikId: number;
        preporuceniParfemi: Array<{ parfemId: number; naziv: string; tipPreporuke: string; score: number }>;
        generisanDatum: Date;
    }): RecommendationResponseDTO {
        return {
            korisnikId: rec.korisnikId,
            preporuke: rec.preporuceniParfemi.map(p => ({
                parfemId: p.parfemId,
                naziv: p.naziv,
                tipPreporuke: p.tipPreporuke, 
                objasnjenje: this.buildObjasnjenje(p.tipPreporuke)
            })),
            generisanDatum: rec.generisanDatum
        };
    }

    private buildObjasnjenje(tip: string): string {
        switch (tip) {
            case RecommendationType.POPULARITY:
                return "Popularan među svim korisnicima";
            case RecommendationType.COLLABORATIVE:
                return "Preporučen na osnovu sličnih kupovina drugih korisnika";
            case RecommendationType.HYBRID:
                return "Kombinovana preporuka – popularan i kupovan zajedno sa sličnim artiklima";
            default:
                return "Preporuka";
        }
    }


}