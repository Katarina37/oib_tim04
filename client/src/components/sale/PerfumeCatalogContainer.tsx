import React, { useMemo, useState } from "react";
import { Package, Search } from "lucide-react";
import { PerfumeDTO } from "../../models/sales/PerfumeDTO";
import PerfumeCatalog from "./PerfumeCatalog";

interface PerfumeCatalogContainerProps {
  perfumes: PerfumeDTO[];
  isLoading: boolean;
  availablePackages: number;
  remainingStockByPerfume: Record<number, number>;
  onAddToCart: (perfume: PerfumeDTO) => void;
}

const PerfumeCatalogContainer: React.FC<PerfumeCatalogContainerProps> = ({
  perfumes,
  isLoading,
  availablePackages,
  remainingStockByPerfume,
  onAddToCart,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPerfumes = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) {
      return perfumes;
    }

    return perfumes.filter(
      (perfume) =>
        perfume.name.toLowerCase().includes(normalizedTerm) ||
        perfume.type.toLowerCase().includes(normalizedTerm)
    );
  }, [perfumes, searchTerm]);

  return (
    <div className="card">
      <div className="card__header">
        <h2 className="card__title">
          <Package size={20} className="card__title-icon" />
          Katalog parfema
        </h2>
        <span className="badge badge--sales-availability">
          Paketa na stanju: <strong>{availablePackages}</strong>
        </span>
      </div>

      <div className="card__body">
        <div className="search-bar mb-md">
          <div className="search-bar__input-wrapper">
            <Search size={16} className="search-bar__icon" />
            <input
              type="text"
              className="input"
              placeholder="Pretraži po imenu ili tipu..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="empty-state sales-catalog-state">
            <p className="text-muted">Učitavanje kataloga...</p>
          </div>
        ) : filteredPerfumes.length === 0 ? (
          <div className="empty-state sales-catalog-state">
            <p className="text-muted">Nema dostupnih parfema za prikaz.</p>
          </div>
        ) : (
          <PerfumeCatalog
            perfumes={filteredPerfumes}
            remainingStockByPerfume={remainingStockByPerfume}
            onAddToCart={onAddToCart}
          />
        )}
      </div>
    </div>
  );
};

export default PerfumeCatalogContainer;
