export interface WarehouseSummaryDTO {
    id: string;         
    name: string;
    address: string;
    capacity: number;
    usedCapacity: number;  
}

export interface PackageSummaryDTO {
    id: string;
    sender: string;
    perfumeCount: number;  
    warehouseName: string; 
    status: "STORED" | "SENT";
}

export interface AvailablePackagesDTO {
    warehouses: WarehouseSummaryDTO[];
    packages: PackageSummaryDTO[];
}