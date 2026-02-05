import React from 'react';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { SaleItemDTO } from '../../models/sales/SaleItemDTO';
import { PaymentMethod } from '../../enums/PaymentMethod';

interface ShoppingCartContainerProps {
  items: SaleItemDTO[];
  total: number;
  paymentMethod: PaymentMethod;
  isSubmitting: boolean;
  onRemove: (index: number) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onCheckout: () => void;
}

const ShoppingCartContainer: React.FC<ShoppingCartContainerProps> = ({
  items,
  total,
  paymentMethod,
  isSubmitting,
  onRemove,
  onPaymentMethodChange,
  onCheckout,
}) => {
  return (
    <div className="card">
      <div className="card__header">
        <h2 className="card__title">
          <ShoppingBag size={20} className="card__title-icon" /> Korpa
        </h2>
      </div>
      <div className="card__body" style={{ padding: 0 }}>
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
                  <div className="text-muted text-xs">
                    {item.quantity} x {item.price.toLocaleString()} RSD
                  </div>
                </div>
                <button
                  className="text-error hover:opacity-80"
                  onClick={() => onRemove(idx)}
                  title="Ukloni stavku"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <div className="p-md mt-md bg-subtle border-t">
              <div className="flex justify-between font-bold text-lg mb-md">
                <span>Ukupno:</span>
                <span>{total.toLocaleString()} RSD</span>
              </div>
            </div>
          </div>
        )}

        <div className="p-md border-t">
          <div className="form-group mb-md">
            <label className="input-group__label">Način plaćanja</label>
            <select
              className="input select"
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value as PaymentMethod)}
            >
              {Object.values(PaymentMethod).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn--primary w-full"
            disabled={items.length === 0 || isSubmitting}
            onClick={onCheckout}
          >
            {isSubmitting ? 'Obrada...' : 'Završi prodaju'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartContainer;
