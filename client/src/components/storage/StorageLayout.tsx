import React from "react";
import WarehousesColumn from "./WarehousesColumn";
import PackagingStorageTable from "./PackagingStorageTable";
import {
    WarehouseSummaryDTO,
    PackageSummaryDTO,
} from "../../models/storage/AvailablePackagesDTO";

interface StorageLayoutProps {
    warehouses: WarehouseSummaryDTO[];
    packages: PackageSummaryDTO[];
}

const StorageLayout: React.FC<StorageLayoutProps> = ({
    warehouses,
    packages,
}) => {
    return (
        <div className="grid grid--2">

            <div className="card">
                <div className="card__header">
                    <h2 className="card__title">Skladišta</h2>
                </div>

                <div className="card__body">
                    <WarehousesColumn warehouses={warehouses} />
                </div>
            </div>

            <div className="card">
                <div className="card__header">
                    <h2 className="card__title">Ambalaže</h2>
                </div>

                <div className="card__body">
                    <PackagingStorageTable packages={packages} />
                </div>
            </div>

        </div>
    );
};

export default StorageLayout;
