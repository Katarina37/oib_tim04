import { Package } from "./Package";

export class PackagePerfume {
    id: number;

    packageId: number;

    perfumeId: number;

    addedAt!: Date;

    package: Package;
}
