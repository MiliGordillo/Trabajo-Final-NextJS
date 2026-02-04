'use client';

import { useState } from 'react';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
  onAddToCart: (productId: string, quantity: number) => void;
  onStockUpdate?: (productId: string, newStock: number) => void;
  isLoading?: boolean;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  stock: initialStock,
  imageUrl,
  onAddToCart,
  onStockUpdate,
  isLoading = false,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [stock, setStock] = useState(initialStock);

  const handleAddToCart = async () => {
    if (quantity < 1 || quantity > stock) return;
    
    setIsAdding(true);
    try {
      await onAddToCart(id, quantity);
      // Actualizar stock local
      const newStock = stock - quantity;
      setStock(newStock);
      if (onStockUpdate) {
        onStockUpdate(id, newStock);
      }
      setQuantity(1);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, Math.min(value, stock)));
  };

  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 3;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-slate-100 hover:border-slate-200 flex flex-col h-full group">
      {/* Imagen */}
      <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex items-center justify-center relative">
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <div className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-xs">
              SIN STOCK
            </div>
          </div>
        )}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'opacity-40' : ''}`}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="16"%3ENo disponible%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="text-slate-400 text-xs font-medium">Sin imagen</div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-semibold text-sm text-slate-900 mb-1 line-clamp-2 leading-tight">
          {name}
        </h3>

        <p className="text-slate-600 text-xs mb-2 line-clamp-2 flex-grow leading-normal">
          {description}
        </p>

        {/* Precio */}
        <div className="mb-2 pt-1.5 border-t border-slate-100">
          <div className="text-2xl font-bold text-blue-600 mb-1.5">
            ${price.toFixed(2)}
          </div>
          <div className="flex items-center gap-2">
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                Sin stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                Solo {stock}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                {stock} disp.
              </span>
            )}
          </div>
        </div>

        {/* Cantidad y Botón */}
        {!isOutOfStock ? (
          <div className="flex gap-2 items-center mt-auto">
            <input
              type="number"
              min="1"
              max={stock}
              value={quantity}
              onChange={handleQuantityChange}
              className="w-16 px-2 py-1.5 border border-slate-300 rounded text-center text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-slate-50 hover:bg-white"
              disabled={isAdding || isLoading}
            />
            <button
              onClick={handleAddToCart}
              disabled={isAdding || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-1.5 px-3 rounded transition-all active:scale-95 shadow-sm hover:shadow-md disabled:cursor-not-allowed text-xs"
            >
              {isAdding ? 'Agregando...' : 'Comprar'}
            </button>
          </div>
        ) : (
          <button
            disabled
            className="w-full py-1.5 px-3 bg-slate-200 text-slate-500 font-semibold rounded cursor-not-allowed text-xs mt-auto"
          >
            No disponible
          </button>
        )}
      </div>
    </div>
  );
}
