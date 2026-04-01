import { IRecommendationRepository } from "../Domain/services/IRecommendationRepository";
import { UserRecommendation } from "../Domain/models/UserRecommendation";
import { AppDataSource } from "../Database/DbConnectionPool";
import { UserRecommendationEntity } from "../Infrastructure/entities/UserRecommendationEntity";
import { ItemCoOccurrenceEntity } from "../Infrastructure/entities/ItemCoOccurrenceEntity";
import { MoreThanOrEqual } from "typeorm";

export class RecommendationRepository implements IRecommendationRepository {
    private userRecRepo = AppDataSource.getRepository(UserRecommendationEntity);
    private coOccurRepo = AppDataSource.getRepository(ItemCoOccurrenceEntity);


    async findLatestByUserId(userId: number): Promise<UserRecommendation | null> {
        const entity = await this.userRecRepo.findOne({
            where: {
                korisnikId: userId,
                isticeDatum: MoreThanOrEqual(new Date())
            },
            order: { generisanDatum: "DESC" }
        });

        if (!entity) return null;
        return this.toDomain(entity);
    }

    async createRecommendation(data: Partial<UserRecommendation>): Promise<UserRecommendation> {
        const entity = this.userRecRepo.create({
            korisnikId: data.korisnikId,
            preporuceniParfemi: (data.preporuceniParfemi ?? []).map(p => ({
                parfemId: p.parfemId,
                naziv: p.naziv,
                preporukaTip: p.tipPreporuke, 
                score: p.score
            })),
            tipPreporuke: data.tipPreporuke,
            isticeDatum: data.isticeDatum ?? new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        const saved = await this.userRecRepo.save(entity);
        return this.toDomain(saved);
    }

    async updateCoOccurrence(parfemId1: number, parfemId2: number): Promise<void> {
        if (parfemId1 === parfemId2) return;

        const [id1, id2] = parfemId1 < parfemId2
            ? [parfemId1, parfemId2]
            : [parfemId2, parfemId1];

        const existing = await this.coOccurRepo.findOne({
            where: { parfemId1: id1, parfemId2: id2 }
        });

        if (existing) {
            existing.zajednickiBrojKupovina += 1;
            await this.coOccurRepo.save(existing);
        } else {
            const newEntry = this.coOccurRepo.create({
                parfemId1: id1,
                parfemId2: id2,
                zajednickiBrojKupovina: 1
            });
            await this.coOccurRepo.save(newEntry);
        }
    }

    async getCoOccurrenceForPerfume(
        parfemId: number,
        limit: number
    ): Promise<Array<{ parfemId2: number; zajednickiBroj: number }>> {
        const asFirst = await this.coOccurRepo.find({
            where: { parfemId1: parfemId },
            order: { zajednickiBrojKupovina: "DESC" },
            take: limit
        });

        const asSecond = await this.coOccurRepo.find({
            where: { parfemId2: parfemId },
            order: { zajednickiBrojKupovina: "DESC" },
            take: limit
        });

        const combined = new Map<number, number>();

        for (const r of asFirst) {
            combined.set(r.parfemId2, (combined.get(r.parfemId2) ?? 0) + r.zajednickiBrojKupovina);
        }
        for (const r of asSecond) {
            combined.set(r.parfemId1, (combined.get(r.parfemId1) ?? 0) + r.zajednickiBrojKupovina);
        }

        return Array.from(combined.entries())
            .map(([id, count]) => ({ parfemId2: id, zajednickiBroj: count }))
            .sort((a, b) => b.zajednickiBroj - a.zajednickiBroj)
            .slice(0, limit);
    }

    async getTopSellingPerfumes(
        limit: number,
        daysBack: number
    ): Promise<Array<{ id: number; naziv: string; ukupnoProdatih: number }>> {
        const query = `
            SELECT
                p.id,
                p.naziv,
                SUM(s.kolicina) AS ukupno_prodatih
            FROM prodaja.stavka_racuna s
            JOIN prodaja.fiskalni_racun fr ON s.fiskalni_racun_id = fr.id
            JOIN prerada.parfem p ON s.parfem_id = p.id
            WHERE fr.datum_kreiranja >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY p.id, p.naziv
            ORDER BY ukupno_prodatih DESC
            LIMIT ?
        `;

        const results: Array<{ id: number; naziv: string; ukupno_prodatih: number }> =
            await AppDataSource.query(query, [daysBack, limit]);

        return results.map(row => ({
            id: row.id,
            naziv: row.naziv,
            ukupnoProdatih: Number(row.ukupno_prodatih)
        }));
    }

    async getUserPurchasedPerfumes(
        userId: number
    ): Promise<Array<{ parfemId: number; naziv: string }>> {
        const query = `
            SELECT DISTINCT
                s.parfem_id  AS parfemId,
                s.naziv_parfema AS naziv
            FROM prodaja.stavka_racuna s
            JOIN prodaja.fiskalni_racun fr ON s.fiskalni_racun_id = fr.id
            WHERE fr.korisnik_id = ?
        `;

        const results: Array<{ parfemId: number; naziv: string }> =
            await AppDataSource.query(query, [userId]);

        return results;
    }

    private toDomain(entity: UserRecommendationEntity): UserRecommendation {
        const rec = new UserRecommendation();
        rec.id = entity.id;
        rec.korisnikId = entity.korisnikId;
        rec.preporuceniParfemi = entity.preporuceniParfemi.map(p => ({
            parfemId: p.parfemId,
            naziv: p.naziv,
            tipPreporuke: p.preporukaTip,  
            score: p.score
        }));
        rec.tipPreporuke = entity.tipPreporuke;
        rec.generisanDatum = entity.generisanDatum;
        rec.isticeDatum = entity.isticeDatum;
        return rec;
    }
}