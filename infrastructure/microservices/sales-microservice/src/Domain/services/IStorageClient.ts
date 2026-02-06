import { UserContext } from "../types/UserContext";

export interface IStorageClient {
  sendPackages(quantity: number, userContext?: UserContext): Promise<number>;
  getInventory(userContext?: UserContext): Promise<any>;
}
