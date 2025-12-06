import { UserRole } from "../enums/UserRole";

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  profileImage?: string;
  password?: string;
}