import { Repository } from "typeorm";
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

  async search(criteria: AuditLogSearchCriteriaDTO): Promise<AuditLog[]> {
    const query = this.repository.createQueryBuilder("log");

    if (criteria.tip_zapisa) {
      query.andWhere("log.tipZapisa = :tipZapisa", { tipZapisa: criteria.tip_zapisa });
    }

    if (criteria.opis) {
      query.andWhere("log.opis LIKE :opis", { opis: `%${criteria.opis}%` });
    }

    if (criteria.mikroservis) {
      query.andWhere("log.mikroservis LIKE :mikroservis", {
        mikroservis: `%${criteria.mikroservis}%`,
      });
    }

    if (criteria.korisnik_id !== undefined) {
      query.andWhere("log.korisnikId = :korisnikId", { korisnikId: criteria.korisnik_id });
    }

    if (criteria.ip_adresa) {
      query.andWhere("log.ipAdresa LIKE :ipAdresa", { ipAdresa: `%${criteria.ip_adresa}%` });
    }

    if (criteria.datum_od) {
      query.andWhere("log.datumVreme >= :datumOd", { datumOd: criteria.datum_od });
    }

    if (criteria.datum_do) {
      query.andWhere("log.datumVreme <= :datumDo", { datumDo: criteria.datum_do });
    }

    query.orderBy("log.datumVreme", "DESC");

    return query.getMany();
  }
}
