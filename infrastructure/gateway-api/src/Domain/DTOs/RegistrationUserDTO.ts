import { UserRole } from "../enums/UserRole";

export interface RegistrationUserDTO {
  username: string;
  password: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  profileImage?: string;
}