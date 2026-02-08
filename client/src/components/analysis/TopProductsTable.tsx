import React from "react";
import { Download } from "lucide-react";
import { formatCurrency } from "../../helpers/formatters";

interface TopProduct {
  productId: number;
  productName: string;
  unitsSold: number;
  revenue: number;
  percentage: number;
}

interface TopProductsTableProps {
  products: TopProduct[];
  onExport?: () => void;
  compact?: boolean;
}

const TopProductsTable: React.FC<TopProductsTableProps> = ({
  products,
  onExport,
  compact = false,
}) => {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p className="text-muted">Nema podataka o top proizvodima.</p>
      </div>
    );
  }

  return (
    <div className="analysis-top-products">
      {!compact && (
        <div className="analysis-top-products__header">
          <h4 className="font-medium">Top {products.length} najprodavanijih parfema</h4>
          {onExport && (
            <button className="btn btn--outline btn--sm" onClick={onExport}>
              <Download size={14} />
              Preuzmi izveštaj
            </button>
          )}
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Naziv</th>
              <th>Prodate jedinice</th>
              <th>Prihod</th>
              {!compact && <th>Udeo</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.productId}>
                <td className="font-medium">{index + 1}</td>
                <td className="font-medium">{product.productName}</td>
                <td>{product.unitsSold.toLocaleString()}</td>
                <td className="font-medium">{formatCurrency(product.revenue)}</td>
                {!compact && <td>{product.percentage.toFixed(1)}%</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!compact && (
        <div className="analysis-top-products__footer">
          <span className="text-muted">Ukupno proizvoda: {products.length}</span>
          <span className="font-medium">
            Ukupan prihod: {formatCurrency(products.reduce((sum, product) => sum + product.revenue, 0))}
          </span>
        </div>
      )}
    </div>
  );
};

export default TopProductsTable;
