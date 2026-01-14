import React from "react";
import WarehousesColumn from "./WarehousesColumn";
import PackagingStorageTable from "./PackagingStorageTable";

const StorageLayout: React.FC = () => {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 p-4">
            {/* lijevo: skladista */}
            <div className="xl:col-span-1">
                <WarehousesColumn />
            </div>

            {/* desno: ambalaze */}
            <div className="xl:col-span-2">
                <PackagingStorageTable />
            </div>
        </div>
    );
};

export default StorageLayout;
