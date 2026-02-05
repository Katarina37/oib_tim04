export interface IStorageClient {
  sendPackages(quantity: number, token?: string): Promise<number>;
  getInventory(token?: string): Promise<any>;
}
