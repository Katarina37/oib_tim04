import React from 'react';
import { PerfumeDTO } from '../../models/sales/PerfumeDTO';

interface PerfumeCatalogProps {
  perfumes: PerfumeDTO[];
  onAddToCart: (perfume: PerfumeDTO) => void;
}

const PerfumeCatalog: React.FC<PerfumeCatalogProps> = ({ perfumes, onAddToCart }) => {
  return (
    <div className="perfume-grid" style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
      gap: 'var(--space-md)' 
    }}>
      {perfumes.map(perfume => (
        <div key={perfume.id} className="card card--subtle">
          <div className="card__body">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold">{perfume.name}</h4>
                <p className="text-muted text-xs mt-xs">{perfume.type}</p>
              </div>
            </div>
            <p className="text-primary font-bold mt-sm">{perfume.price.toLocaleString()} RSD</p>
            <p className="text-muted text-xs">{perfume.volumeMl} ml</p>
            <p className="text-muted text-xs">Na stanju: {perfume.stock}</p>
            <button 
              className="btn btn--secondary btn--sm w-full mt-md"
              onClick={() => onAddToCart(perfume)}
              disabled={perfume.stock === 0}
            >
              Dodaj u korpu
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PerfumeCatalog;