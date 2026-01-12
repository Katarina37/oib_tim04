export interface IStorageRepository {
    getAvailablePackages(): Promise<number>;
    sendPackages(quantity: number): Promise<number>;
    addPackages(quantity: number): Promise<void>;
}
