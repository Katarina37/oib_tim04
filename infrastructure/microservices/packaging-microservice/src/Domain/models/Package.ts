import { Warehouse } from "./Warehouse";
import { PackageState } from "../enums/PackageState";
import { PackagePerfume } from "./PackagePerfume";

export class Package {
    id: number;

    name: string;

    sender: string;

    state!: PackageState;

    createdAt!: Date;

    updatedAt!: Date;

    warehouse: Warehouse | null;

    perfumes: PackagePerfume[];
}
