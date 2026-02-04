// src/app/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import ConfirmDialog from '@/components/Confirm';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string;
}

interface User {
  role: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    imageUrl: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterStock, setFilterStock] = useState<'all' | 'available'>('all');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  useEffect(() => {
    (async () => {
      const auth = await checkUserRole();
      if (auth) {
        await loadProducts();
      } else {
        setLoading(false);
      }
    })();
  }, []);

  const checkUserRole = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const user = await res.json();
        setIsAdmin(user.role === 'ADMIN');
        setIsAuthenticated(true);
        return true;
      }
      setIsAuthenticated(false);
      return false;
    } catch (err) {
      console.error('Error checking user role:', err);
      setIsAuthenticated(false);
      return false;
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const url = editingId
        ? `/api/products/${editingId}`
        : '/api/products';

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          imageUrl: formData.imageUrl || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al guardar producto');
        return;
      }

      setSuccessMessage(editingId ? 'Producto actualizado' : 'Producto creado');
      setFormData({ name: '', description: '', price: '', stock: '', imageUrl: '' });
      setEditingId(null);
      loadProducts();
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      imageUrl: product.imageUrl || '',
    });
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    setProductToDelete(id);
    setShowConfirmDialog(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    setDeletingProduct(true);
    try {
      const res = await fetch(`/api/products/${productToDelete}`, { method: 'DELETE' });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al eliminar');
        setShowConfirmDialog(false);
        setProductToDelete(null);
        setDeletingProduct(false);
        return;
      }

      setSuccessMessage('Producto eliminado');
      loadProducts();
      setShowConfirmDialog(false);
      setProductToDelete(null);
    } catch (err) {
      setError('Error de conexión');
      setShowConfirmDialog(false);
      setProductToDelete(null);
    } finally {
      setDeletingProduct(false);
    }
  };

  const handleAddToCart = async (productId: string, quantity: number) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Error al agregar al carrito');
        return;
      }

      setSuccessMessage('Producto agregado al carrito');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const handleStockUpdate = (productId: string, newStock: number) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, stock: newStock } : p
    ));
  };

  const filteredProducts = products.filter(p => {
    if (filterStock === 'available') return p.stock > 0;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Cargando productos...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">PRODUCTOS</h1>
            <p className="text-slate-500 mt-1">Debes iniciar sesión para ver el catálogo completo</p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 text-center max-w-lg w-full">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Acceso requerido</h2>
            <p className="text-slate-600 mb-4">Inicia sesión para acceder al catálogo y realizar compras.</p>
            <div className="flex gap-3 justify-center">
              <a href="/login?next=/products" className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Iniciar sesión</a>
              <a href="/register" className="px-5 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">Crear cuenta</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">PRODUCTOS</h1>
          <p className="text-slate-500 mt-1">
            {isAdmin ? 'Gestiona el inventario' : `${filteredProducts.length} producto${filteredProducts.length !== 1 ? 's' : ''} disponible${filteredProducts.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {isAdmin && (
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    {editingId ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{editingId ? 'Editar' : 'Nuevo'} Producto</h2>
                    <p className="text-blue-100 text-sm">{editingId ? 'Modifica los detalles' : 'Agrega al inventario'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Información Básica
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Nombre del producto</label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ej: Camiseta Premium"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Descripción</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe el producto..."
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 resize-none"
                      />
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Precio y Stock
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Precio ($)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                          <input
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Cantidad</label>
                        <div className="relative">
                          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <input
                            name="stock"
                            type="number"
                            min="0"
                            value={formData.stock}
                            onChange={handleInputChange}
                            placeholder="0"
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Imagen del Producto
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">URL de la imagen</label>
                      <input
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    {formData.imageUrl && (
                      <div className="relative rounded-xl overflow-hidden bg-slate-100 aspect-video">
                        <img
                          src={formData.imageUrl}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                          <div className="text-center">
                            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            URL no válida
                          </div>
                        </div>
                      </div>
                    )}
                    {!formData.imageUrl && (
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                        <svg className="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-slate-400">Agrega una URL para ver la vista previa</p>
                      </div>
                    )}
                  </div>

                  <div className="p-5 bg-slate-50">
                    <div className="flex gap-3">
                      <button 
                        type="submit" 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
                      >
                        {editingId ? (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Guardar Cambios
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Crear Producto
                          </>
                        )}
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setFormData({ name: '', description: '', price: '', stock: '', imageUrl: '' });
                          }}
                          className="px-5 py-3 border border-slate-300 text-slate-600 rounded-xl hover:bg-white hover:border-slate-400 transition-all font-medium"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={isAdmin ? 'lg:col-span-3' : 'lg:col-span-4'}>
          {/* Filtros */}
          {!isAdmin && (
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setFilterStock('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStock === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Todos ({products.length})
              </button>
              <button
                onClick={() => setFilterStock('available')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStock === 'available'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Disponibles ({products.filter(p => p.stock > 0).length})
              </button>
            </div>
          )}

          {/* Grid de productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-400 text-lg">
                  {products.length === 0
                    ? 'No hay productos disponibles'
                    : 'No hay productos en stock'}
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id}>
                  {isAdmin ? (
                    <div className="card flex flex-col h-full">
                      {product.imageUrl && (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={300}
                          height={160}
                          className="w-full h-40 object-cover rounded-lg mb-4"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">{product.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mt-1 mb-4">{product.description}</p>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100 mb-4">
                        <span className="font-bold text-blue-600">${product.price}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
                        </span>
                      </div>
                      <div className="flex gap-2 flex-col">
                        <button
                          onClick={() => handleEdit(product)}
                          className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      description={product.description}
                      price={product.price}
                      stock={product.stock}
                      imageUrl={product.imageUrl}
                      onAddToCart={handleAddToCart}
                      onStockUpdate={handleStockUpdate}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Eliminar Producto"
        message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        onConfirm={confirmDeleteProduct}
        onCancel={() => {
          setShowConfirmDialog(false);
          setProductToDelete(null);
        }}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deletingProduct}
      />
    </div>
  );
}


