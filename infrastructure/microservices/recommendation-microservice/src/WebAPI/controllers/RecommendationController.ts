import { Router, Request, Response, NextFunction } from "express";
import { IRecommendationService } from "../../Domain/services/IRecommendationService";
import { ILoggerService } from "../../Domain/services/ILoggerService";
import { LogLevel } from "../../Domain/enums/LogLevel";
import { RecommendationRequestDTO } from "../../Domain/DTOs/RecommendationRequestDTO";
import {
    validateUserId,
    validateRecommendationQuery,
    validateCoOccurrenceUpdate
} from "../validators/RecommendationValidator"

export class RecommendationController {
    public router = Router();

    constructor(
        private service: IRecommendationService,
        private logger: ILoggerService
    ) {
        this.initializeRoutes();
    }

    public getRouter(): Router {
        return this.router;
    }

    private initializeRoutes(): void {
        this.router.get("/recommendations/:userId", this.getRecommendations.bind(this));
        this.router.post("/recommendations/update-cooccurrence", this.updateCoOccurrence.bind(this));
    }

    private async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userIdValidation = validateUserId(req.params.userId);
            if (!userIdValidation.success) {
                res.status(400).json({ message: userIdValidation.message });
                return;
            }

            const queryValidation = validateRecommendationQuery(req.query);
            if (!queryValidation.success) {
                res.status(400).json({ message: queryValidation.message });
                return;
            }

            const userId = Number.parseInt(req.params.userId, 10);
            const limit = req.query.limit ? Number.parseInt(req.query.limit as string, 10) : undefined;
            const refresh = req.query.refresh === "true";

            const requestDto: RecommendationRequestDTO = {
                korisnikId: userId,
                limit,
                refresh
            };

            const recommendations = await this.service.getRecommendationsForUser(requestDto);
            res.status(200).json(recommendations);
        } catch (error) {
            await this.logger.log(
                `Error getting recommendations: ${(error as Error).message}`,
                LogLevel.ERROR
            );
            next(error);
        }
    }

    private async updateCoOccurrence(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validation = validateCoOccurrenceUpdate(req.body);
            if (!validation.success) {
                res.status(400).json({ message: validation.message });
                return;
            }

            const { parfemId1, parfemId2 } = req.body as { parfemId1: number; parfemId2: number };
            await this.service.updateCoOccurrence(parfemId1, parfemId2);

            res.status(200).json({
                message: "Co-occurrence podaci ažurirani",
                parfemId1,
                parfemId2
            });
        } catch (error) {
            await this.logger.log(
                `Error updating co-occurrence: ${(error as Error).message}`,
                LogLevel.ERROR
            );
            next(error);
        }
    }
}