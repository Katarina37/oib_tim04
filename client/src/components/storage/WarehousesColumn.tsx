import React from "react";
import { WarehouseSummaryDTO } from "../../models/storage/AvailablePackagesDTO";
import { Package } from "lucide-react";

interface Props {
    warehouses: WarehouseSummaryDTO[];
}

const WarehousesColumn: React.FC<Props> = ({ warehouses }) => {
    return (
        <div className="space-y-4">
            {warehouses.length > 0 ? (
                warehouses.map((w: WarehouseSummaryDTO) => {
                    const percent = Math.round((w.usedCapacity / w.capacity) * 100);
                    return (
                        <div
                            key={w.id}
                            className="rounded-lg border border-gray-200 bg-white p-5 hover:shadow-lg transition-all duration-200"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        {w.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {w.address}
                                    </p>
                                </div>
                                <div className="ml-3 p-2 bg-orange-50 rounded-lg">
                                    <Package className="h-5 w-5 text-orange-600" />
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600">Kapacitet</span>
                                    <span className="font-semibold text-gray-900">
                                        {w.usedCapacity} / {w.capacity}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                    <div
                                        className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    {percent}% popunjeno
                                </p>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nema skladista</p>
                </div>
            )}
        </div>
    );
};

export default WarehousesColumn;