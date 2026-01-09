import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { PackageState } from "../enums/PackageState";

@Entity("ambalaza")
export class Package {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        name: "kolicina",
        type: "int",
    })
    quantity!: number;

    @Column({
        name: "stanje",
        type: "enum",
        enum: PackageState,
        default: PackageState.AVAILABLE,
    })
    state!: PackageState;

    @CreateDateColumn({ name: "datum_kreiranja" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "datum_azuriranja" })
    updatedAt!: Date;
}
