export type StoragePerfumeType = "parfem" | "kolonjska_voda";
export type StorageBottleVolume = 150 | 250;

export interface PackagePerfumesDTO {
    quantity: number;
    targetWarehouseId?: number;
    perfumeType?: StoragePerfumeType;
    perfumeName?: string;
    bottleVolumeMl?: StorageBottleVolume;
    packageName?: string;
    senderAddress?: string;
}
