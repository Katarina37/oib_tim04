import { Repository } from "typeorm";
import { Sale } from "../../Domain/models/Sale";
import { Db } from "../../DataBase/DbConnectionPool";
import { ISaleRepository } from "../../Domain/repositories/ISaleRepository";

export class TypeORMSaleRepository implements ISaleRepository {
    private repository: Repository<Sale>;

    constructor() {
        this.repository = Db.getRepository(Sale);
    }

    async create(sale: Partial<Sale>): Promise<Sale | null> {
        return this.repository.create(sale);
    }

    async save(sale: Sale): Promise<Sale> {
        return this.repository.save(sale);
    }

    async findById(id: number): Promise<Sale | null> {
        return this.repository.findOne({ 
            where: { id },
            relations: ['items'],
        }) || null;
    }

    async findAll(): Promise<Sale[]> {
        return this.repository.find({ relations: ['items'] });
    }

    async findByBillNumber(billNumber: string): Promise<Sale | null> {
        return this.repository.findOne({ 
            where: { billNumber },
            relations: ['items'],
        }) || null;
    }

    async remove(sale: Sale): Promise<void> {
        await this.repository.remove(sale);
    }
}