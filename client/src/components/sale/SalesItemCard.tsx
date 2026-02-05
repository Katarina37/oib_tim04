import React from 'react';
import { Package, Plus } from 'lucide-react';

interface SalesItemCardProps {
  id: number;
  name: string;
  price: number;
  stock: number;
  onAdd: () => void;
}

const SalesItemCard: React.FC<SalesItemCardProps> = ({ name, price, stock, onAdd }) => {
  const isOutOfStock = stock <= 0;

  return (
    <div className={`card card--subtle ${isOutOfStock ? 'opacity-50' : ''}`}>
      <div className="card__body p-md">
        <div className="flex justify-between items-start mb-sm">
          <h4 className="font-bold text-lg">{name}</h4>
          <Package size={18} className="text-muted" />
        </div>
        <div className="flex justify-between items-end mt-md">
          <div>
            <p className="text-primary font-bold text-xl">{price.toLocaleString()} RSD</p>
            <p className={`text-xs ${isOutOfStock ? 'text-error' : 'text-success'}`}>
              {isOutOfStock ? 'Nema na stanju' : `Na stanju: ${stock}`}
            </p>
          </div>
          <button 
            className="btn btn--secondary btn--sm" 
            onClick={onAdd}
            disabled={isOutOfStock}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesItemCard;