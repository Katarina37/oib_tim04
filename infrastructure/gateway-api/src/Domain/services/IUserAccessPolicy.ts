export interface IUserAccessPolicy {
  ensureCanAccess(currentUserId: number | undefined, requestedUserId: number): void;
}
