export type AuthTokenClaims = {
  id: number;
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
};