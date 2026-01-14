import React from "react";
import { Package } from "lucide-react";

interface Warehouse {
    id: string;
    name: string;
    address: string;
    used: number;
    capacity: number;
}

const warehouses: Warehouse[] = [
    {
        id: "central",
        name: "Centralno skladište",
        address: "Pariz, Rue de la Paix 45",
        used: 67,
        capacity: 100,
    },
    {
        id: "north",
        name: "Severno skladište",
        address: "Pariz, Avenue Foch 12",
        used: 45,
        capacity: 75,
    },
    {
        id: "south",
        name: "Juno skladište",
        address: "Pariz, Blvd. Saint-Germain 89",
        used: 28,
        capacity: 50,
    },
];

const WarehousesColumn: React.FC = () => {
    return (
        <div className="space-y-4">
            {warehouses.map((w) => {
                const percent = Math.round((w.used / w.capacity) * 100);
                return (
                    <div
                        key={w.id}
                        className="rounded-2xl bg-white shadow-sm p-4"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-semibold">{w.name}</h3>
                                <p className="text-sm text-gray-500">{w.address}</p>
                            </div>
                            <Package className="h-5 w-5 text-orange-500" />
                        </div>

                        <div className="flex justify-between text-sm mb-1">
                            <span>Kapacitet</span>
                            <span className="font-medium">
                                {w.used} / {w.capacity}
                            </span>
                        </div>

                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-orange-500 h-2 rounded-full"
                                style={{ width: `${percent}%` }}
                            ></div>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                            {percent}% popunjeno
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default WarehousesColumn;
