import React from 'react';
import { Plus } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    price: number;
    type: string; // Parfem ili Kolonjska voda
}

interface ProductCardProps {
    product: Product;
    onAdd: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd }) => (
    <div className="card card--subtle">
        <div className="card__body">
            <div className="flex justify-between">
                <h4 className="font-bold">{product.name}</h4>
                <span className="text-xs text-muted">{product.type}</span>
            </div>
            <p className="text-primary font-bold mt-sm">{product.price} RSD</p>
            <button className="btn btn--secondary btn--sm w-full mt-md" onClick={() => onAdd(product)}>
                <Plus size={14} /> Dodaj
            </button>
        </div>
    </div>
);