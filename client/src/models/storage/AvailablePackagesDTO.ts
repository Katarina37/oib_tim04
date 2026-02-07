export interface WarehouseSummaryDTO {
    id: number;
    name: string;
    address: string;
    capacity: number;
    usedCapacity: number;
}

export type PackageStatus =
    | "spakovana"
    | "rezervisana"
    | "poslata"
    | "raspakovana";

export interface PackageSummaryDTO {
    id: string;
    sender: string;
    perfumeCount: number;
    warehouseName: string;
    status: PackageStatus;
}

export interface AvailablePackagesDTO {
    distributiveCenter: number;
    warehouseCenter: number;
}
