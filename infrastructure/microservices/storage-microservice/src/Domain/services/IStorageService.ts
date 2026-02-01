export interface IStorageService {
    sendPackages(quantity: number): Promise<number>;
}
