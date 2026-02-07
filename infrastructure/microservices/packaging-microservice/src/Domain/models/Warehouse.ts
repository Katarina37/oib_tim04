import { Package } from "./Package";

export class Warehouse {
    id: number;

    name: string;

    address: string;

    capacity: number;

    createdAt!: Date;

    updatedAt!: Date;

    packages: Package[];

}
