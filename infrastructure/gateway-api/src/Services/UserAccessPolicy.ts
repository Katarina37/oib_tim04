import { AccessDeniedError } from "../Domain/errors/AccessDeniedError";
import { IUserAccessPolicy } from "../Domain/services/IUserAccessPolicy";

export class UserAccessPolicy implements IUserAccessPolicy {
  ensureCanAccess(currentUserId: number | undefined, requestedUserId: number): void {
    if (!currentUserId || currentUserId !== requestedUserId) {
      throw new AccessDeniedError("You can only access your own data!");
    }
  }
}
