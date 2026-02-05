import React, { useState, useMemo } from 'react';
import { Package } from 'lucide-react';
import { PerfumeDTO } from '../../models/sales/PerfumeDTO';
import PerfumeCatalog from './PerfumeCatalog';

interface PerfumeCatalogContainerProps {
  perfumes: PerfumeDTO[];
  isLoading: boolean;
  onAddToCart: (perfume: PerfumeDTO) => void;
}

const PerfumeCatalogContainer: React.FC<PerfumeCatalogContainerProps> = ({
  perfumes,
  isLoading,
  onAddToCart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPerfumes = useMemo(() => {
    return perfumes.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [perfumes, searchTerm]);

  return (
    <div className="card">
      <div className="card__header">
        <h2 className="card__title">
          <Package size={20} className="card__title-icon" /> Katalog parfema
        </h2>
      </div>
      <div className="card__body">
        <div className="form-group mb-md">
          <input
            type="text"
            className="input"
            placeholder="Pretraži po imenu ili tipu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center" style={{ minHeight: '300px' }}>
            <p className="text-muted">Učitavanje kataloga...</p>
          </div>
        ) : filteredPerfumes.length === 0 ? (
          <div className="flex justify-center items-center" style={{ minHeight: '300px' }}>
            <p className="text-muted">Nema dostupnih parfema</p>
          </div>
        ) : (
          <PerfumeCatalog perfumes={filteredPerfumes} onAddToCart={onAddToCart} />
        )}
      </div>
    </div>
  );
};

export default PerfumeCatalogContainer;
