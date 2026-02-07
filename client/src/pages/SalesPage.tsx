import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ShoppingCart as CartIcon, Wallet, PackageCheck, ReceiptText } from "lucide-react";
import { useAuth } from "../hooks/useAuthHook";
import { useServices } from "../contexts/ServiceContext";
import { SaleType } from "../enums/SaleType";
import { PaymentMethod } from "../enums/PaymentMethod";
import { CreateSaleDTO } from "../models/sales/CreateSaleDTO";
import { CartSaleItemDTO } from "../models/sales/SaleItemDTO";
import { PerfumeDTO } from "../models/sales/PerfumeDTO";
import { SaleResponseDTO } from "../models/sales/SaleResponseDTO";
import StatsCard from "../components/production/StatsCard";
import PerfumeCatalogContainer from "../components/sale/PerfumeCatalogContainer";
import ShoppingCartContainer from "../components/sale/ShoppingCartContainer";

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responsePayload = error.response?.data as
      | { message?: string; error?: string | { message?: string } }
      | undefined;
    const flatError =
      typeof responsePayload?.error === "string"
        ? responsePayload.error
        : undefined;
    const nestedError =
      typeof responsePayload?.error === "object"
        ? responsePayload.error?.message
        : undefined;

    return (
      responsePayload?.message ??
      nestedError ??
      flatError ??
      error.message ??
      "Greska pri obradi zahteva."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Doslo je do neocekivane greske.";
};

const formatDateTime = (isoDate: string): string => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const SalesPage: React.FC = () => {
  const { token, user } = useAuth();
  const { saleAPI } = useServices();

  const [perfumes, setPerfumes] = useState<PerfumeDTO[]>([]);
  const [salesHistory, setSalesHistory] = useState<SaleResponseDTO[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [cart, setCart] = useState<CartSaleItemDTO[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadSalesData = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoadingData(true);
    setError(null);

    try {
      const [catalog, allSales] = await Promise.all([
        saleAPI.getAvailablePerfumes(token),
        saleAPI.getAllSales(token),
      ]);

      setPerfumes(catalog);
      setSalesHistory(allSales);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsLoadingData(false);
    }
  }, [saleAPI, token]);

  useEffect(() => {
    void loadSalesData();
  }, [loadSalesData]);

  const availablePackages = useMemo(() => {
    if (perfumes.length === 0) {
      return 0;
    }

    return perfumes.reduce((minStock, perfume) => Math.min(minStock, perfume.stock), perfumes[0].stock);
  }, [perfumes]);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const remainingStockByPerfume = useMemo(() => {
    const quantitiesInCart = new Map<number, number>();
    for (const item of cart) {
      quantitiesInCart.set(
        item.perfumeId,
        (quantitiesInCart.get(item.perfumeId) ?? 0) + item.quantity
      );
    }

    return perfumes.reduce<Record<number, number>>((accumulator, perfume) => {
      const quantityInCart = quantitiesInCart.get(perfume.id) ?? 0;
      accumulator[perfume.id] = Math.max(perfume.stock - quantityInCart, 0);
      return accumulator;
    }, {});
  }, [perfumes, cart]);

  const recentSales = useMemo(() => {
    return [...salesHistory]
      .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
      .slice(0, 5);
  }, [salesHistory]);

  const handleAddToCart = (perfume: PerfumeDTO) => {
    setError(null);
    setSuccessMessage(null);

    const remainingForPerfume = remainingStockByPerfume[perfume.id] ?? 0;
    if (remainingForPerfume <= 0) {
      setError(`Nema više dostupnih jedinica za "${perfume.name}".`);
      return;
    }

    if (totalItems >= availablePackages) {
      setError("Nema dovoljno dostupnih paketa za dodavanje novih stavki u korpu.");
      return;
    }

    setCart((prev) => {
      const currentTotalItems = prev.reduce((sum, item) => sum + item.quantity, 0);
      if (currentTotalItems >= availablePackages) {
        setError("Nema dovoljno dostupnih paketa za dodavanje novih stavki u korpu.");
        return prev;
      }

      const existingIndex = prev.findIndex((item) => item.perfumeId === perfume.id);

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
        setError(`Nema više dostupnih jedinica za "${perfume.name}".`);
        return prev;
      }

      return prev.map((item, index) =>
        index === existingIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    });
  };

  const handleExecuteSale = async () => {
    if (!token || !user?.id || cart.length === 0) {
      return;
    }

    if (totalItems > availablePackages) {
      setError("Korpa sadrzi vise stavki od dostupnog broja paketa.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const normalizedItems = cart
        .map((item) => ({
          perfumeId: Number(item.perfumeId),
          quantity: Math.max(1, Number(item.quantity) || 1),
        }))
        .filter(
          (item) =>
            Number.isInteger(item.perfumeId) &&
            item.perfumeId > 0 &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0
        );

      if (normalizedItems.length === 0) {
        setError("Korpa sadrzi neispravne stavke. Osvezite stranicu i pokusajte ponovo.");
        return;
      }

      const dto: CreateSaleDTO = {
        userId: user.id,
        type: SaleType.RETAIL,
        paymentMethod,
        items: normalizedItems,
      };

      const result = await saleAPI.executeSale(dto, token);
      const soldQuantitiesByPerfume = cart.reduce<Record<number, number>>((accumulator, item) => {
        accumulator[item.perfumeId] = (accumulator[item.perfumeId] ?? 0) + item.quantity;
        return accumulator;
      }, {});

      setSuccessMessage(`Prodaja uspesno kreirana. Racun: ${result.billNumber}`);
      setPerfumes((prev) =>
        prev.map((perfume) => {
          const soldQuantity = soldQuantitiesByPerfume[perfume.id] ?? 0;
          if (soldQuantity <= 0) {
            return perfume;
          }

          return {
            ...perfume,
            stock: Math.max(perfume.stock - soldQuantity, 0),
          };
        })
      );
      setSalesHistory((prev) => [result, ...prev]);
      setCart([]);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="production-page">
      <div className="page-header">
        <h1 className="page-header__title">Servis prodaje</h1>
        <p className="page-header__subtitle">
          Kreiranje fiskalnih računa i upravljanje trenutnom prodajom
        </p>
      </div>

      <div className="stats-grid">
        <StatsCard
          icon={<CartIcon size={24} />}
          value={cart.length}
          label="Različitih stavki u korpi"
        />
        <StatsCard
          icon={<PackageCheck size={24} />}
          value={availablePackages}
          label="Dostupni paketi"
        />
        <StatsCard
          icon={<Wallet size={24} />}
          value={`${totalAmount.toLocaleString()} RSD`}
          label="Vrednost korpe"
        />
        <StatsCard
          icon={<ReceiptText size={24} />}
          value={salesHistory.length}
          label="Ukupno računa"
        />
      </div>

      <div className="grid grid--sales">
        <PerfumeCatalogContainer
          perfumes={perfumes}
          isLoading={isLoadingData}
          availablePackages={availablePackages}
          remainingStockByPerfume={remainingStockByPerfume}
          onAddToCart={handleAddToCart}
        />

        <div className="sales-sidebar">
          {error && <div className="auth-form__error">{error}</div>}
          {successMessage && <div className="auth-form__success">{successMessage}</div>}

          <ShoppingCartContainer
            items={cart}
            total={totalAmount}
            totalItems={totalItems}
            availablePackages={availablePackages}
            paymentMethod={paymentMethod}
            isSubmitting={isSubmitting}
            onRemove={(index) => {
              setError(null);
              setCart((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
            }}
            onPaymentMethodChange={setPaymentMethod}
            onCheckout={handleExecuteSale}
          />

          <div className="card">
            <div className="card__header">
              <h2 className="card__title">
                <ReceiptText size={20} className="card__title-icon" />
                Poslednji računi
              </h2>
            </div>
            <div className="card__body sales-history">
              {recentSales.length === 0 ? (
                <p className="text-muted">Nema evidentiranih prodaja.</p>
              ) : (
                <div className="sales-history__list">
                  {recentSales.map((sale) => (
                    <div key={sale.id} className="sales-history__item">
                      <div>
                        <p className="font-medium">{sale.billNumber}</p>
                        <p className="text-muted">{formatDateTime(sale.createdAt)}</p>
                      </div>
                      <strong>{sale.totalAmount.toLocaleString()} RSD</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
