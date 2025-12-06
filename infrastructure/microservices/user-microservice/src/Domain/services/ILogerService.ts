export interface ILogerService {
  log(message: string, type?: string): Promise<boolean>;
}