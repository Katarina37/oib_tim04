import React from "react";
import { PackageSearch } from "lucide-react";
import { PackageSummaryDTO, PackageStatus } from "../../models/storage/AvailablePackagesDTO";

interface Props {
    packages: PackageSummaryDTO[];
}

const getStatusMeta = (status: PackageStatus): { label: string; className: string } => {
    switch (status) {
        case "spakovana":
            return { label: "Spakovana", className: "badge--storage-packed" };
        case "rezervisana":
            return { label: "Rezervisana", className: "badge--storage-reserved" };
        case "poslata":
            return { label: "Poslata", className: "badge--storage-sent" };
        case "raspakovana":
            return { label: "Raspakovana", className: "badge--storage-unpacked" };
        default:
            return { label: status, className: "badge--info" };
    }
};

const PackagingStorageTable: React.FC<Props> = ({ packages }) => {
    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th style={{ width: "70px" }}>ID</th>
                        <th>Posiljalac</th>
                        <th style={{ width: "130px" }}>Broj parfema</th>
                        <th>Skladiste</th>
                        <th style={{ width: "140px" }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {packages.length > 0 ? (
                        packages.map((packaging: PackageSummaryDTO) => {
                            const statusMeta = getStatusMeta(packaging.status);

                            return (
                                <tr key={packaging.id}>
                                    <td>{packaging.id}</td>
                                    <td>{packaging.sender}</td>
                                    <td className="text-center">
                                        <span className="font-medium">{packaging.perfumeCount}</span>
                                    </td>
                                    <td>
                                        {packaging.warehouseName ? (
                                            packaging.warehouseName
                                        ) : (
                                            <span className="text-muted">Nije dodeljeno</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${statusMeta.className}`}>
                                            {statusMeta.label}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={5}>
                                <div className="empty-state">
                                    <div className="empty-state__icon">
                                        <PackageSearch size={56} />
                                    </div>
                                    <h3 className="empty-state__title">Nema ambalaža</h3>
                                    <p className="empty-state__description">
                                        Trenutno nema zapisa o ambalažama za prikaz.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PackagingStorageTable;
