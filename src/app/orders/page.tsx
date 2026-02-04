// src/app/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import OrderActionsModal from '@/components/OrderActionsModal';
import ConfirmDialog from '@/components/Confirm';

interface Order {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  total: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  product: { name: string; price: number; stock: number };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [deletingOrder, setDeletingOrder] = useState(false);

  useEffect(() => {
    loadOrders();
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const user = await res.json();
        setIsAdmin(user.role === 'ADMIN');
      }
    } catch (err) {
      console.error('Error checking user role:', err);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 401) {
          setError('Debes iniciar sesión');
          return;
        }
        setError('Error al cargar órdenes');
        return;
      }
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        setError('Error al actualizar orden');
        return;
      }

      loadOrders();
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const deleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
    setShowConfirmDialog(true);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    setDeletingOrder(true);
    try {
      const res = await fetch(`/api/orders/${orderToDelete}`, { method: 'DELETE' });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al eliminar orden');
        setShowConfirmDialog(false);
        setOrderToDelete(null);
        setDeletingOrder(false);
        return;
      }

      loadOrders();
      setShowModal(false);
      setShowConfirmDialog(false);
      setOrderToDelete(null);
    } catch (err) {
      setError('Error de conexión');
      setShowConfirmDialog(false);
      setOrderToDelete(null);
    } finally {
      setDeletingOrder(false);
    }
  };

  const handleOpenModal = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleUpdateSuccess = () => {
    loadOrders();
    handleCloseModal();
  };

  const statusColors: { [key: string]: string } = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-purple-100 text-purple-700',
    DELIVERED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Cargando pedidos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">PEDIDOS</h1>
        <p className="text-slate-500">{isAdmin ? 'Gestión de todas las órdenes' : 'Historial de compras'}</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {orders.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <p>No hay órdenes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Orden ID</th>
                  {isAdmin && <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Cliente</th>}
                  <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Producto</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Cantidad</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Total</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Estado</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Fecha</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{order.id.slice(0, 8)}</td>
                    {isAdmin && <td className="px-6 py-4 text-slate-600">{order.user.name}</td>}
                    <td className="px-6 py-4 text-slate-600">{order.product.name}</td>
                    <td className="px-6 py-4 text-slate-600">{order.quantity}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {isAdmin ? (
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-xs px-2 py-1 rounded border border-slate-200"
                        >
                          <option value="PENDING">Pendiente</option>
                          <option value="PROCESSING">Procesando</option>
                          <option value="SHIPPED">Enviado</option>
                          <option value="DELIVERED">Entregado</option>
                          <option value="CANCELLED">Cancelado</option>
                        </select>
                      ) : (
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {isAdmin ? (
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                          >
                            Eliminar
                          </button>
                        ) : (
                          <>
                            {order.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleOpenModal(order)}
                                  className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => deleteOrder(order.id)}
                                  className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                >
                                  Eliminar
                                </button>
                              </>
                            )}
                            {order.status !== 'PENDING' && (
                              <button
                                onClick={() => handleOpenModal(order)}
                                className="text-xs px-3 py-1 bg-slate-50 text-slate-600 rounded hover:bg-slate-100 transition-colors"
                              >
                                Ver detalles
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedOrder && (
        <OrderActionsModal
          order={selectedOrder}
          onClose={handleCloseModal}
          onUpdate={handleUpdateSuccess}
        />
      )}

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Eliminar Orden"
        message="¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer."
        onConfirm={confirmDeleteOrder}
        onCancel={() => {
          setShowConfirmDialog(false);
          setOrderToDelete(null);
        }}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deletingOrder}
      />
    </div>
  );
}