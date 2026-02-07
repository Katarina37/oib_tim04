import React from "react";
import { Plus, PackageSearch } from "lucide-react";
import { PerfumeDTO, PerfumeType } from "../../models/sales/PerfumeDTO";

interface PerfumeCatalogProps {
  perfumes: PerfumeDTO[];
  remainingStockByPerfume: Record<number, number>;
  onAddToCart: (perfume: PerfumeDTO) => void;
}

const getTypeLabel = (type: PerfumeType): { label: string; className: string } => {
  switch (type) {
    case PerfumeType.COLOGNE:
      return {
        label: "Kolonjska voda",
        className: "badge badge--sales-cologne",
      };
    case PerfumeType.PERFUME:
    default:
      return {
        label: "Parfem",
        className: "badge badge--sales-perfume",
      };
  }
};

const PerfumeCatalog: React.FC<PerfumeCatalogProps> = ({
  perfumes,
  remainingStockByPerfume,
  onAddToCart,
}) => {
  return (
    <div className="sales-catalog-grid">
      {perfumes.map((perfume) => {
        const remainingStock = remainingStockByPerfume[perfume.id] ?? perfume.stock;
        const isOutOfStock = remainingStock <= 0;
        const typeBadge = getTypeLabel(perfume.type);

        return (
          <article
            key={perfume.id}
            className={`sales-product-card ${isOutOfStock ? "sales-product-card--out" : ""}`}
          >
            <header className="sales-product-card__header">
              <div>
                <h4 className="font-bold">{perfume.name}</h4>
                <span className={typeBadge.className}>
                  {typeBadge.label}
                </span>
              </div>
              <PackageSearch size={18} className="text-muted" />
            </header>

            <div className="sales-product-card__details">
              <p className="sales-product-card__price">{perfume.price.toLocaleString()} RSD</p>
              <p className="text-muted">{perfume.volumeMl} ml</p>
              <p className={isOutOfStock ? "text-error" : "text-success"}>
                Na stanju: {remainingStock}
              </p>
            </div>

            <button
              className="btn btn--secondary btn--sm sales-product-card__action"
              onClick={() => onAddToCart(perfume)}
              disabled={isOutOfStock}
            >
              <Plus size={14} />
              Dodaj u korpu
            </button>
          </article>
        );
      })}
    </div>
  );
};

export default PerfumeCatalog;
