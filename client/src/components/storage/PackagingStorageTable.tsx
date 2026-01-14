import React from "react";

interface PackagingRow {
    id: string;
    sender: string;
    perfumeCount: number;
    warehouse: string;
    status: "STORED" | "SENT";
}

const rows: PackagingRow[] = [
    {
        id: "AMB-2025-001",
        sender: "Centar za pakovanje 1",
        perfumeCount: 24,
        warehouse: "Centralno skladište",
        status: "STORED",
    },
    {
        id: "AMB-2025-002",
        sender: "Centar za pakovanje 1",
        perfumeCount: 18,
        warehouse: "Centralno skladište",
        status: "SENT",
    },
    {
        id: "AMB-2025-003",
        sender: "Centar za pakovanje 2",
        perfumeCount: 30,
        warehouse: "Severno skladište",
        status: "STORED",
    },
];

const PackagingStorageTable: React.FC = () => {
    return (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">
                Ambalaže u skladištu
            </h2>

            <div className="overflow-x-auto mt-3">
                <table className="w-full text-sm">
                    <thead className="border-b">
                        <tr className="text-left">
                            <th className="py-2">ID ambalaže</th>
                            <th>Pošiljalac</th>
                            <th>Broj parfema</th>
                            <th>Skladište</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => (
                            <tr key={r.id} className="border-b last:border-none">
                                <td className="py-2 font-medium">{r.id}</td>
                                <td>{r.sender}</td>
                                <td>{r.perfumeCount}</td>
                                <td>{r.warehouse}</td>
                                <td>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${r.status === "STORED"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-blue-100 text-blue-700"
                                            }`}
                                    >
                                        {r.status === "STORED"
                                            ? "Skladištena"
                                            : "Poslata"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PackagingStorageTable;
