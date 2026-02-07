import React from 'react';
import { Trash2, ShoppingBag } from 'lucide-react';
import { CartSaleItemDTO } from '../../models/sales/SaleItemDTO';

interface ShoppingCartProps {
  items: CartSaleItemDTO[];
  onRemove: (index: number) => void;
  total: number;
}

const ShoppingCart: React.FC<ShoppingCartProps> = ({ items, onRemove, total }) => {
  return (
    <div className="shopping-cart">
      {items.length === 0 ? (
        <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
          <ShoppingBag size={48} className="text-muted mb-md" />
          <p>Korpa je prazna</p>
        </div>
      ) : (
        <div className="cart-items">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-sm border-b">
              <div>
                <div className="font-bold">{item.name}</div>
                <div className="text-muted text-xs">{item.quantity} x {item.price} RSD</div>
              </div>
              <button className="text-error" onClick={() => onRemove(idx)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <div className="p-md mt-md bg-subtle border-t">
            <div className="flex justify-between font-bold text-lg">
              <span>Ukupno:</span>
              <span>{total} RSD</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;
