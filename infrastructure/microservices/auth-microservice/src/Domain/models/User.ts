import { UserRole } from "../enums/UserRole";

export class User {
  id!: number;

  username!: string;

  password!: string;

  email!: string;

  firstName!: string | null;

  lastName!: string | null;

  role!: UserRole;

  profileImage!: string | null;

  createdAt!: Date;

  updatedAt!: Date;
}
