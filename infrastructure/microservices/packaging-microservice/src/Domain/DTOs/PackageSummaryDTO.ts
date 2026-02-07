import { PackageState } from "../enums/PackageState";

export interface PackageSummaryDTO {
    id: string;
    sender: string;
    perfumeCount: number;
    warehouseName: string;
    status: PackageState; 
}