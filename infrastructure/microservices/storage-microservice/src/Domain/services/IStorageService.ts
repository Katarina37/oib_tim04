export interface IStorageService {
    sendPackages(quantity: number): Promise<number>;
    reservePackages(quantity: number): Promise<number[]>;
    sendReservedPackages(packageIds: number[]): Promise<number>;
    unpackPackages(packageIds: number[]): Promise<number>;
    releasePackages(packageIds: number[]): Promise<number>;
}
