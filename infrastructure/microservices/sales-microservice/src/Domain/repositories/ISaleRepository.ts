import { Sale } from "../models/Sale";

export interface ISaleRepository {
  create(sale: Partial<Sale>): Promise<Sale | null>;
  save(sale: Sale): Promise<Sale>;
  findById(id: number): Promise<Sale | null>;
  findAll(): Promise<Sale[]>;
  findByBillNumber(billNumber: string): Promise<Sale | null>;
  remove(sale: Sale): Promise<void>;
}