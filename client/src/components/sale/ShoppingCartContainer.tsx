import React from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import { CartSaleItemDTO } from "../../models/sales/SaleItemDTO";
import { PaymentMethod } from "../../enums/PaymentMethod";

interface ShoppingCartContainerProps {
  items: CartSaleItemDTO[];
  total: number;
  totalItems: number;
  availablePackages: number;
  paymentMethod: PaymentMethod;
  isSubmitting: boolean;
  onRemove: (index: number) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onCheckout: () => void;
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "Gotovina",
  [PaymentMethod.CARD]: "Kartično",
  [PaymentMethod.TRANSFER]: "Uplata na račun",
};

const ShoppingCartContainer: React.FC<ShoppingCartContainerProps> = ({
  items,
  total,
  totalItems,
  availablePackages,
  paymentMethod,
  isSubmitting,
  onRemove,
  onPaymentMethodChange,
  onCheckout,
}) => {
  const remainingCapacity = Math.max(availablePackages - totalItems, 0);

  return (
    <div className="card">
      <div className="card__header">
        <h2 className="card__title">
          <ShoppingBag size={20} className="card__title-icon" />
          Korpa
        </h2>
      </div>

      <div className="card__body sales-cart">
        {items.length === 0 ? (
          <div className="empty-state sales-cart-empty">
            <ShoppingBag size={40} className="text-muted" />
            <p className="text-muted">Korpa je prazna.</p>
          </div>
        ) : (
          <div className="sales-cart__items">
            {items.map((item, index) => (
              <div key={`${item.perfumeId}-${index}`} className="sales-cart-item">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted">
                    {item.quantity} x {item.price.toLocaleString()} RSD
                  </p>
                </div>
                <button
                  className="btn btn--ghost btn--icon btn--sm"
                  onClick={() => onRemove(index)}
                  title="Ukloni stavku"
                  aria-label={`Ukloni ${item.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="sales-cart__summary">
          <div className="sales-cart__summary-row">
            <span>Ukupno stavki</span>
            <strong>{totalItems}</strong>
          </div>
          <div className="sales-cart__summary-row">
            <span>Preostali paketi</span>
            <strong>{remainingCapacity}</strong>
          </div>
          <div className="sales-cart__summary-row sales-cart__summary-row--total">
            <span>Ukupan iznos</span>
            <strong>{total.toLocaleString()} RSD</strong>
          </div>
        </div>

        <div className="input-group">
          <label className="input-group__label">Način plaćanja</label>
          <select
            className="input select"
            value={paymentMethod}
            onChange={(event) => onPaymentMethodChange(event.target.value as PaymentMethod)}
          >
            {Object.values(PaymentMethod).map((method) => (
              <option key={method} value={method}>
                {paymentMethodLabels[method]}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn btn--primary sales-cart__checkout"
          disabled={items.length === 0 || isSubmitting || totalItems > availablePackages}
          onClick={onCheckout}
        >
          {isSubmitting ? "Obrada..." : "Završi prodaju"}
        </button>
      </div>
    </div>
  );
};

export default ShoppingCartContainer;
