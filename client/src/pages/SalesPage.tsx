// src/pages/SalesPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart as CartIcon, Wallet } from 'lucide-react';
import { useAuth } from '../hooks/useAuthHook';
import { useServices } from '../contexts/ServiceContext';
import { SaleType } from '../enums/SaleType';
import { PaymentMethod } from '../enums/PaymentMethod';
import { CreateSaleDTO } from '../models/sales/CreateSaleDTO';
import { SaleItemDTO } from '../models/sales/SaleItemDTO';
import { PerfumeDTO } from '../models/sales/PerfumeDTO';
import StatsCard from '../components/production/StatsCard';
import PerfumeCatalogContainer from '../components/sale/PerfumeCatalogContainer';
import ShoppingCartContainer from '../components/sale/ShoppingCartContainer';

export const SalesPage: React.FC = () => {
  const { token, user } = useAuth();
  const { saleAPI } = useServices();

  const [perfumes, setPerfumes] = useState<PerfumeDTO[]>([]);
  const [isLoadingPerfumes, setIsLoadingPerfumes] = useState(true);
  const [cart, setCart] = useState<SaleItemDTO[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Učitaj dostupne parfeme sa servera
  useEffect(() => {
    const loadPerfumes = async () => {
      if (!token) return;
      try {
        setIsLoadingPerfumes(true);
        const data = await saleAPI.getAvailablePerfumes(token);
        setPerfumes(data);
      } catch (err) {
        console.error('Greška pri učitavanju parfema:', err);
      } finally {
        setIsLoadingPerfumes(false);
      }
    };

    loadPerfumes();
  }, [token, saleAPI]);

  const totalAmount = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), 
  [cart]);

  const handleAddToCart = (perfume: PerfumeDTO) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.perfumeId === perfume.id);
      if (existingIndex === -1) {
        return [
          ...prev,
          {
            perfumeId: perfume.id,
            name: perfume.name,
            price: perfume.price,
            quantity: 1,
          },
        ];
      }

      const existing = prev[existingIndex];
      if (existing.quantity >= perfume.stock) {
        return prev;
      }

      return prev.map((item, idx) =>
        idx === existingIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    });
  };

  const handleExecuteSale = async () => {
    if (!token || !user?.id || cart.length === 0) return;
    setIsSubmitting(true);
    try {
      const dto: CreateSaleDTO = {
    userId: user.id,
    type: SaleType.RETAIL,
    paymentMethod: paymentMethod, // Proveri da li se PaymentMethod enum poklapa sa bekom
    items: cart.map(item => ({
        perfumeId: item.perfumeId, // PAZI OVDE: mapiraj tvoj 'id' u 'perfumeId'
        quantity: item.quantity || 1,
        price: item.price,
        name: item.name
    }))
};
      const result = await saleAPI.executeSale(dto, token);
      alert(`Uspešno! Račun: ${result.billNumber}`);
      setCart([]);
    } catch (err) {
      // console.error(err);
      console.error("Detalji greške:", err instanceof Error ? err.stack : err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="production-page">
      <div className="page-header">
        <h1 className="page-header__title">Servis prodaje</h1>
        <p className="page-header__subtitle">Maloprodaja i izdavanje računa</p>
      </div>

      <div className="stats-grid" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <StatsCard icon={<CartIcon size={24} />} value={cart.length} label="Stavke u korpi" />
        <StatsCard icon={<Wallet size={24} />} value={`${totalAmount.toLocaleString()} RSD`} label="Total" />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1.5fr 1fr', 
        gap: 'var(--space-lg)', 
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 var(--space-md)'
      }}>
        <PerfumeCatalogContainer
          perfumes={perfumes}
          isLoading={isLoadingPerfumes}
          onAddToCart={handleAddToCart}
        />

        <ShoppingCartContainer
          items={cart}
          total={totalAmount}
          paymentMethod={paymentMethod}
          isSubmitting={isSubmitting}
          onRemove={(idx) => setCart(cart.filter((_, i) => i !== idx))}
          onPaymentMethodChange={setPaymentMethod}
          onCheckout={handleExecuteSale}
        />
      </div>
    </div>
  );
};