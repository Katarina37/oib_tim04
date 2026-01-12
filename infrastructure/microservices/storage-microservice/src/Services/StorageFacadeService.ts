import { IStorageService } from "../Domain/services/IStorageService";
import { UserRole } from "../Domain/enums/UserRole";

export class StorageFacadeService {
    constructor(
        private readonly distributionCenter: IStorageService,
        private readonly warehouseCenter: IStorageService
    ) { }

    getStorageService(role: UserRole): IStorageService {
        switch (role) {
            case UserRole.MANAGER:
                return this.distributionCenter;
            case UserRole.SELLER:
                return this.warehouseCenter;
            default:
                throw new Error("Nedozvoljena uloga za pristup skladistu");
        }
    }

}
