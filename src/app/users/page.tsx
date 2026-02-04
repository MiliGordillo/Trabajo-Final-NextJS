// src/app/users/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/Confirm';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  useEffect(() => {
    checkAdminAndLoadUsers();
  }, []);

  const checkAdminAndLoadUsers = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const user = await res.json();
      if (user.role !== 'ADMIN') {
        router.push('/');
        return;
      }
      setIsAdmin(true);
      loadUsers();
    } catch (err) {
      router.push('/login');
    }
  };

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } else {
        setError('Error al cargar usuarios');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Todos los campos son requeridos');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear usuario');
        return;
      }

      setSuccessMessage('Usuario creado exitosamente');
      setFormData({ name: '', email: '', password: '', role: 'CUSTOMER' });
      loadUsers();
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const deleteUser = (userId: string) => {
    setUserToDelete(userId);
    setShowConfirmDialog(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setDeletingUser(true);
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userToDelete }),
      });

      if (!res.ok) {
        setError('Error al eliminar usuario');
        setShowConfirmDialog(false);
        setUserToDelete(null);
        setDeletingUser(false);
        return;
      }

      setSuccessMessage('Usuario eliminado');
      loadUsers();
      setShowConfirmDialog(false);
      setUserToDelete(null);
    } catch (err) {
      setError('Error de conexión');
      setShowConfirmDialog(false);
      setUserToDelete(null);
    } finally {
      setDeletingUser(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
        <p className="text-slate-500">Solo administradores pueden acceder a esta sección.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}

      <div className="card">
        <h2 className="font-bold mb-4 text-slate-800">Registrar Nuevo Usuario</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-sm font-medium mb-2 block">Nombre</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nombre completo"
              className="input"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="usuario@ejemplo.com"
              className="input"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Contraseña</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="input"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Rol</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="input"
            >
              <option value="CUSTOMER">Cliente</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">
            Agregar Usuario
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Nombre</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Email</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Rol</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Registrado</th>
                <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="text-xs px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Eliminar Usuario"
        message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
        onConfirm={confirmDeleteUser}
        onCancel={() => {
          setShowConfirmDialog(false);
          setUserToDelete(null);
        }}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deletingUser}
      />
    </div>
  );
}


