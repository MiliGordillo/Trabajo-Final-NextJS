'use client';

import { useState } from 'react';

interface OrderActionsModalProps {
  order: {
    id: string;
    quantity: number;
    status: string;
    product: { name: string; stock: number; price: number };
    total: number;
    createdAt: string;
  };
  onClose: () => void;
  onUpdate: () => void;
}

const statusColors: { [key: string]: { bg: string; text: string; label: string } } = {
  PENDING: { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pendiente' },
  PROCESSING: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Procesando' },
  SHIPPED: { bg: 'bg-purple-50', text: 'text-purple-700', label: 'Enviado' },
  DELIVERED: { bg: 'bg-green-50', text: 'text-green-700', label: 'Entregado' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', label: 'Cancelado' },
};

export default function OrderActionsModal({ order, onClose, onUpdate }: OrderActionsModalProps) {
  const [quantity, setQuantity] = useState(order.quantity);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdateQuantity = async () => {
    if (quantity < 1) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al actualizar cantidad');
        return;
      }

      onUpdate();
      setIsEditing(false);
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = statusColors[order.status];
  const maxQuantity = order.product.stock + order.quantity;
  const newTotal = order.product.price * quantity;

  return (
    <>
      {/* Overlay suave sin fondo negro */}
      <div
        className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? 'Editar Cantidad' : 'Detalles de la Orden'}
              </h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4 flex items-start gap-2">
                <span className="text-red-600 text-lg flex-shrink-0"></span>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Orden ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Orden ID
                </label>
                <p className="text-sm text-slate-900 font-mono">{order.id.slice(0, 12)}</p>
              </div>

              {/* Producto */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Producto
                </label>
                <p className="text-slate-900 font-medium">{order.product.name}</p>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Estado
                </label>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusColor.bg} ${statusColor.text}`}>
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {statusColor.label}
                </div>
              </div>

              {/* Cantidad */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Cantidad
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={maxQuantity}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all"
                      />
                      <span className="text-xs text-slate-600 font-medium">
                        máx: {maxQuantity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Nuevo total: <span className="font-bold text-blue-600">${newTotal.toFixed(2)}</span>
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-slate-900">{quantity}</span>
                    <span className="text-sm text-slate-600">unidades</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-slate-700">Total:</span>
                <span className="text-lg font-bold text-blue-600">${(isEditing ? newTotal : order.total).toFixed(2)}</span>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Fecha de Orden
                </label>
                <p className="text-sm text-slate-600">
                  {new Date(order.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-2">
            {!isEditing && order.status === 'PENDING' && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm shadow-sm hover:shadow-md active:scale-95"
              >
                Editar Cantidad
              </button>
            )}

            {isEditing && (
              <>
                <button
                  onClick={handleUpdateQuantity}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium text-sm shadow-sm hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setQuantity(order.quantity);
                    setError('');
                  }}
                  className="px-4 py-2 bg-slate-300 text-slate-900 rounded-lg hover:bg-slate-400 transition-all font-medium text-sm"
                >
                  Cancelar
                </button>
              </>
            )}

            {!isEditing && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-300 text-slate-900 rounded-lg hover:bg-slate-400 transition-all font-medium text-sm"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
