import React from "react";
import { PackageSummaryDTO } from "../../models/storage/AvailablePackagesDTO";

interface Props {
    packages: PackageSummaryDTO[];
}

const PackagingStorageTable: React.FC<Props> = ({ packages }) => {
    return (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm mb-lg">
            <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="w-1/12 py-3 px-4 text-left text-sm font-semibold text-gray-900">
                                ID
                            </th>
                            <th className="w-3/12 py-3 px-4 text-left text-sm font-semibold text-gray-900">
                                Posiljalac
                            </th>
                            <th className="w-2/12 py-3 px-4 text-left text-sm font-semibold text-gray-900">
                                Broj parfema
                            </th>
                            <th className="w-3/12 py-3 px-4 text-left text-sm font-semibold text-gray-900">
                                Skladiste
                            </th>
                            <th className="w-3/12 py-3 px-4 text-left text-sm font-semibold text-gray-900">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {packages.length > 0 ? (
                            packages.map((r: PackageSummaryDTO) => (
                                <tr
                                    key={r.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                                        {r.id}
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-700">
                                        {r.sender}
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-700 text-center">
                                        {r.perfumeCount}
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-700">
                                        {r.warehouseName}
                                    </td>
                                    <td className="py-4 px-4 text-sm">
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${r.status === "STORED"
                                                    ? "bg-green-50 text-green-700 border border-green-200"
                                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                                                }`}
                                        >
                                            {r.status === "STORED" ? "Skladištena" : "Poslata"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="py-12 text-center text-gray-500"
                                >
                                    Nema ambalaža u skladistima
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PackagingStorageTable;
