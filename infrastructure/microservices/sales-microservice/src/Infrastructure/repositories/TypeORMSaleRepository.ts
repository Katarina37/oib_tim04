import { Repository } from "typeorm";
import { Sale } from "../../Domain/models/Sale";
import { SaleItem } from "../../Domain/models/SaleItem";
import { Db } from "../../DataBase/DbConnectionPool";
import { ISaleRepository } from "../../Domain/repositories/ISaleRepository";
import { SaleEntity } from "../entities/SaleEntity";
import { SaleItemEntity } from "../entities/SaleItemEntity";

export class TypeORMSaleRepository implements ISaleRepository {
    private repository: Repository<SaleEntity>;

    constructor() {
        this.repository = Db.getRepository(SaleEntity);
    }

    async create(sale: Partial<Sale>): Promise<Sale | null> {
        const entity = this.repository.create(this.toEntityPartial(sale));
        return this.toDomainSale(entity);
    }

    async save(sale: Sale): Promise<Sale> {
        const saved = await this.repository.save(this.toEntity(sale));
        return this.toDomainSale(saved);
    }

    async findById(id: number): Promise<Sale | null> {
        const found = await this.repository.findOne({
            where: { id },
            relations: ["items"],
        });

        return found ? this.toDomainSale(found) : null;
    }

    async findAll(): Promise<Sale[]> {
        const entities = await this.repository.find({ relations: ["items"] });
        return entities.map((entity) => this.toDomainSale(entity));
    }

    async findByBillNumber(billNumber: string): Promise<Sale | null> {
        const found = await this.repository.findOne({
            where: { billNumber },
            relations: ["items"],
        });

        return found ? this.toDomainSale(found) : null;
    }

    async remove(sale: Sale): Promise<void> {
        await this.repository.delete(sale.id);
    }

    private toEntityPartial(sale: Partial<Sale>): Partial<SaleEntity> {
        return {
            id: sale.id,
            billNumber: sale.billNumber,
            salesType: sale.salesType,
            paymentMethod: sale.paymentMethod,
            totalAmount: sale.totalAmount,
            createdAt: sale.createdAt,
            items: sale.items?.map((item) => this.toItemEntity(item)),
        };
    }

    private toEntity(sale: Sale): SaleEntity {
        const entity = new SaleEntity();
        if (sale.id) {
            entity.id = sale.id;
        }

        entity.billNumber = sale.billNumber;
        entity.salesType = sale.salesType;
        entity.paymentMethod = sale.paymentMethod;
        entity.totalAmount = sale.totalAmount;
        entity.createdAt = sale.createdAt;
        entity.items = (sale.items ?? []).map((item) => {
            const itemEntity = this.toItemEntity(item);
            itemEntity.sale = entity;
            return itemEntity;
        });

        return entity;
    }

    private toItemEntity(item: SaleItem): SaleItemEntity {
        const entity = new SaleItemEntity();
        if (item.id) {
            entity.id = item.id;
        }

        entity.perfumeId = item.perfumeId;
        entity.perfumeName = item.perfumeName;
        entity.quantity = item.quantity;
        entity.pricePerUnit = item.pricePerUnit;
        entity.totalPrice = item.totalPrice;
        return entity;
    }

    private toDomainSale(entity: SaleEntity): Sale {
        const domainSale = new Sale();
        domainSale.id = entity.id;
        domainSale.billNumber = entity.billNumber;
        domainSale.salesType = entity.salesType;
        domainSale.paymentMethod = entity.paymentMethod;
        domainSale.totalAmount = entity.totalAmount;
        domainSale.createdAt = entity.createdAt;
        domainSale.items = (entity.items ?? []).map((itemEntity) =>
            this.toDomainItem(itemEntity, domainSale)
        );

        return domainSale;
    }

    private toDomainItem(itemEntity: SaleItemEntity, sale: Sale): SaleItem {
        const domainItem = new SaleItem();
        domainItem.id = itemEntity.id;
        domainItem.perfumeId = itemEntity.perfumeId;
        domainItem.perfumeName = itemEntity.perfumeName;
        domainItem.quantity = itemEntity.quantity;
        domainItem.pricePerUnit = itemEntity.pricePerUnit;
        domainItem.totalPrice = itemEntity.totalPrice;
        domainItem.sale = sale;
        return domainItem;
    }
}
