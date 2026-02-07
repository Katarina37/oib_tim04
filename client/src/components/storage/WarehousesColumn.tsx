import React from "react";
import { WarehouseSummaryDTO } from "../../models/storage/AvailablePackagesDTO";
import { Package, Warehouse } from "lucide-react";

interface Props {
    warehouses: WarehouseSummaryDTO[];
}

const WarehousesColumn: React.FC<Props> = ({ warehouses }) => {
    return (
        <div className="storage-warehouse-list">
            {warehouses.length > 0 ? (
                warehouses.map((w: WarehouseSummaryDTO) => {
                    const percent = w.capacity > 0
                        ? Math.min(100, Math.round((w.usedCapacity / w.capacity) * 100))
                        : 0;

                    return (
                        <article key={w.id} className="storage-warehouse-card">
                            <div className="storage-warehouse-card__header">
                                <div>
                                    <h3 className="storage-warehouse-card__title">
                                        {w.name}
                                    </h3>
                                    <p className="storage-warehouse-card__address">
                                        {w.address}
                                    </p>
                                </div>
                                <div className="storage-warehouse-card__icon">
                                    <Warehouse size={18} />
                                </div>
                            </div>

                            <div className="storage-warehouse-card__capacity">
                                <div className="storage-warehouse-card__capacity-row">
                                    <span className="text-muted">Kapacitet</span>
                                    <span className="font-medium">
                                        {w.usedCapacity} / {w.capacity}
                                    </span>
                                </div>
                                <div className="storage-capacity-bar">
                                    <div
                                        className="storage-capacity-bar__fill"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                                <p className="storage-warehouse-card__percent">
                                    {percent}% popunjeno
                                </p>
                            </div>
                        </article>
                    );
                })
            ) : (
                <div className="empty-state">
                    <div className="empty-state__icon">
                        <Package size={56} />
                    </div>
                    <h3 className="empty-state__title">Nema skladista</h3>
                    <p className="empty-state__description">
                        Trenutno nema registrovanih skladisnih lokacija.
                    </p>
                </div>
            )}
        </div>
    );
};

export default WarehousesColumn;
