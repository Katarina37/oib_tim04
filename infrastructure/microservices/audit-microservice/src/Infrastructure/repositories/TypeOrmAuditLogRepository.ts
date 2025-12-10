import { Repository, FindOptionsWhere, Between, Like } from "typeorm";
import {
  CreateAuditLogData,
  IAuditLogRepository,
} from "../../Domain/repositories/IAuditLogRepository";
import { AuditLog } from "../../Domain/models/AuditLog";
import { AuditLogSearchCriteriaDTO } from "../../Domain/DTOs/AuditLogSearchCriteriaDTO";

export class TypeOrmAuditLogRepository implements IAuditLogRepository {
  constructor(private readonly repository: Repository<AuditLog>) {}

  findAll(): Promise<AuditLog[]> {
    return this.repository.find({ order: { datumVreme: "DESC" } });
  }

  findById(id: number): Promise<AuditLog | null> {
    return this.repository.findOne({ where: { id } });
  }

  create(data: CreateAuditLogData): AuditLog {
    return this.repository.create({
      tipZapisa: data.tip_zapisa,
      opis: data.opis,
      mikroservis: data.mikroservis ?? null,
      korisnikId: data.korisnik_id ?? null,
      ipAdresa: data.ip_adresa ?? null,
      dodatniPodaci: data.dodatni_podaci ?? null,
    });
  }

  save(log: AuditLog): Promise<AuditLog> {
    return this.repository.save(log);
  }

  async remove(log: AuditLog): Promise<void> {
    await this.repository.remove(log);
  }

  search(criteria: AuditLogSearchCriteriaDTO): Promise<AuditLog[]> {
    const where: FindOptionsWhere<AuditLog> = {};

    if (criteria.tip_zapisa) {
      where.tipZapisa = criteria.tip_zapisa;
    }
    if (criteria.mikroservis) {
      where.mikroservis = Like(`%${criteria.mikroservis}%`);
    }
    if (criteria.korisnik_id) {
      where.korisnikId = criteria.korisnik_id;
    }
    if (criteria.datum_od && criteria.datum_do) {
      where.datumVreme = Between(criteria.datum_od, criteria.datum_do);
    }

    return this.repository.find({
      where,
      order: { datumVreme: "DESC" },
    });
  }
}
