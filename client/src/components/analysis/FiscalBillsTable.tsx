import React from "react";
import { FileText, Download, Eye } from "lucide-react";
import { FiscalBillDTO } from "../../models/analysis/FiscalBillDTO";
import { formatCurrency, formatDate } from "../../helpers/formatters";

    interface FiscalBillsTableProps {
    bills: FiscalBillDTO[];
    onExport: (id: number, type: 'fiscal') => void;
    isLoading?: boolean;
    }

    const FiscalBillsTable: React.FC<FiscalBillsTableProps> = ({ bills, onExport, isLoading = false }) => {
    const getPaymentMethodLabel = (method: string) => {
        switch (method) {
            case 'cash': return 'Gotovina';
            case 'card': return 'Kartica';
            case 'bank_transfer': return 'Uplata na račun';
            default: return method;
        }
    };

    const getSaleTypeLabel = (type: string) => {
        switch(type) {
            case 'retail': return 'Maloprodaja';
            case 'wholesale': return 'Veleprodaja';
            default: return type;
        }
    };

    if(isLoading){
        return (
            <div className="flex justify-center py-8">
                <div className="spinner"></div>
            </div>
        );
    }

    if(bills.length === 0){
        return(
            <div className="text-center py-8">
                <FileText className="mx-auto text-text-muted mb-2" size={48}/>
                <p className="text-text-muted">Nema fiskalnih računa za prikaz</p>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>Broj računa</th>
                        <th>Tip prodaje</th>
                        <th>Način plaćanja</th>
                        <th>Iznos (RSD)</th>
                        <th>Datum</th>
                        <th className="text-right">Akcije</th>
                    </tr>
                </thead>
                <tbody>
                    {bills.map((bill) => (
                        <tr key={bill.id}>
                            <td className="font-medium">FR-{bill.id}</td>
                            <td>
                                <span className="{`badge ${bill.saleType === 'retail' ? 'badge--info' : 'badge--success'}`}">
                                    {getSaleTypeLabel(bill.saleType)}
                                </span>
                            </td>
                            <td>{getPaymentMethodLabel(bill.paymentMethod)}</td>
                            <td className="font-bold">{formatCurrency(bill.totalAmount)}</td>
                            <td>{formatDate(bill.createdAt)}</td>
                            <td>
                                <div className="flex justify-end gap-1">
                                    <button className="btn btn--ghost btn--icon btn-sm" title="Pregled" onClick={() => {/*... */}}>
                                        <Eye size={14}/>
                                    </button>
                                    <button className="btn btn--ghost btn--icon btn--sm" title="Preuzmi PDF" onClick={() => onExport(bill.id, 'fiscal')}>
                                        <Download size={14}/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </table>
        </div>
    );
};

export default FiscalBillsTable;
