import { UserRole } from "../enums/UserRole";

export interface UserSearchCriteriaDTO {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}