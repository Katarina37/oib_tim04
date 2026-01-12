import { ISaleService } from "../Domain/services/ISaleService";
import { ISaleRepository } from "../Domain/repositories/ISaleRepository";
import { CreateSaleDto } from "../Domain/DTOs/CreateSaleDTO";
import { SaleResponseDTO } from "../Domain/DTOs/SaleResponseDTO";
import { Sale } from "../Domain/models/Sale";
import { SaleItem } from "../Domain/models/SaleItem";
import { PaymentMethod } from "../Domain/enums/PaymentMethod";
import { SaleType } from "../Domain/enums/SaleType";
import { IAuditClient } from "../Domain/services/IAuditClient";

export class SaleService implements ISaleService {
    constructor(
        private readonly saleRepository: ISaleRepository,
        private readonly auditClient: IAuditClient
    ) {}

    async executeSale(data: CreateSaleDto): Promise<SaleResponseDTO> {
        const newSale = await this.saleRepository.create({
            salesType: data.type as SaleType,
            paymentMethod: data.paymentMethod as PaymentMethod,
            totalAmount: 0,
            billNumber: '',
            items: [] as SaleItem[],
        });

        if (!newSale) {
            throw new Error("Failed to create a new sale.");
        }

        let totalAmount = 0;
        newSale.items = data.items.map(itemDTO => {
            const itemTotal = itemDTO.price * itemDTO.quantity;
            totalAmount += itemTotal;
            
            const item = new SaleItem();
            item.perfumeId = itemDTO.perfumeId;
            item.perfumeName = itemDTO.name;
            item.quantity = itemDTO.quantity;
            item.pricePerUnit = itemDTO.price;
            item.totalPrice = itemTotal;

            return item;
        });

        newSale.totalAmount = totalAmount;

        const savedSale = await this.saleRepository.save(newSale);

        savedSale.billNumber = `FR-2026-${savedSale.id}`;
        const finalSale = await this.saleRepository.save(savedSale);

        await this.auditClient.sendLog({
            tip_zapisa: "INFO",
            opis: `Izvrsena prodaja sa ID-jem ${finalSale.id} i brojem racuna ${finalSale.billNumber}.`,
            mikroservis: "sales-microservice",
            korisnik_id: data.userId,
            dodatni_podaci: {total: finalSale.totalAmount, items: finalSale.items.length},
        });

        return this.toDTO(finalSale)
    }
    
    async getSaleById(id: number): Promise<SaleResponseDTO> {
        const sale = await this.saleRepository.findById(id);

        if (!sale) {
            throw new Error(`Sale with ID ${id} not found.`);
        }

        return this.toDTO(sale);
    }

    async getAllSales(): Promise<SaleResponseDTO[]> {
        const sales =  await this.saleRepository.findAll();
        return sales.map(sale => this.toDTO(sale));
    }

    async getSaleByBillNumber(billNumber: string): Promise<SaleResponseDTO> {
        const sale = await this.saleRepository.findByBillNumber(billNumber);
        if (!sale) {
            throw new Error(`Sale with bill number ${billNumber} not found.`);
        }

        return this.toDTO(sale);
    }

    async deleteSale(id: number): Promise<void> {
        const sale = await this.saleRepository.findById(id);

        if (!sale) {
            throw new Error(`Sale with ID ${id} not found.`);
        }

        await this.saleRepository.remove(sale);

        await this.auditClient.sendLog({
            tip_zapisa: "WARNING",
            opis: `Obrisan racun: ${sale.billNumber} sa ID-jem ${sale.id}.`,
            mikroservis: "sales-microservice",
            dodatni_podaci: { deletedSaleId: sale.id },
        });
    }

    private toDTO(sale: Sale): SaleResponseDTO {
        return {
            id: sale.id,
            billNumber: sale.billNumber,
            type: sale.salesType,
            paymentMethod: sale.paymentMethod,
            totalAmount: sale.totalAmount,
            createdAt: sale.createdAt,
            items: sale.items.map(item => ({
                perfumeName: item.perfumeName,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
            })),
        };
    }
}