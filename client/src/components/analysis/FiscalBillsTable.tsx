import React from "react";
import { Download, FileText } from "lucide-react";
import { FiscalBillDTO } from "../../models/analysis/FiscalBillDTO";
import { formatCurrency, formatDate } from "../../helpers/formatters";

interface FiscalBillsTableProps {
  bills: FiscalBillDTO[];
  onExport: (id: number, type: "fiscal") => void;
  isLoading?: boolean;
}

const FiscalBillsTable: React.FC<FiscalBillsTableProps> = ({
  bills,
  onExport,
  isLoading = false,
}) => {
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "Gotovina";
      case "card":
        return "Kartica";
      case "bank_transfer":
        return "Uplata na racun";
      default:
        return method;
    }
  };

  const getSaleTypeLabel = (type: string) => {
    switch (type) {
      case "retail":
        return "Maloprodaja";
      case "wholesale":
        return "Veleprodaja";
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="empty-state">
        <div className="spinner" />
        <p className="mt-md text-muted">Ucitavanje fiskalnih racuna...</p>
      </div>
    );
  }

  if (bills.length === 0) {
    return (
      <div className="empty-state">
        <FileText className="empty-state__icon" />
        <h3 className="empty-state__title">Nema fiskalnih racuna</h3>
        <p className="empty-state__description">Za izabrani period nije pronadjen nijedan racun.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Broj racuna</th>
            <th>Tip prodaje</th>
            <th>Nacin placanja</th>
            <th>Iznos</th>
            <th>Datum</th>
            <th className="text-right">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((bill) => (
            <tr key={bill.id}>
              <td className="font-medium">FR-{bill.id}</td>
              <td>
                <span className={`badge ${bill.saleType === "retail" ? "badge--info" : "badge--success"}`}>
                  {getSaleTypeLabel(bill.saleType)}
                </span>
              </td>
              <td>{getPaymentMethodLabel(bill.paymentMethod)}</td>
              <td className="font-bold">{formatCurrency(bill.totalAmount)}</td>
              <td>{formatDate(bill.createdAt)}</td>
              <td className="text-right">
                <button
                  className="btn btn--outline btn--sm btn--pdf"
                  title="Preuzmi PDF"
                  onClick={() => onExport(bill.id, "fiscal")}
                >
                  <Download size={14} />
                  PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FiscalBillsTable;
