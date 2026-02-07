import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "../../Domain/enums/UserRole";

@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", unique: true, length: 100 })
  username!: string;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  firstName!: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  lastName!: string | null;

  @Column({ type: "enum", enum: UserRole, default: UserRole.SELLER })
  role!: UserRole;

  @Column({ type: "longtext", nullable: true })
  profileImage!: string | null;

  @CreateDateColumn({ name: "datum_kreiranja" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "datum_azuriranja" })
  updatedAt!: Date;
}
