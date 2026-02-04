import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Package, ShoppingCart, Users, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-12 rounded-2xl border border-blue-200">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Bienvenido a PrismaStore</h1>
          <p className="text-lg text-slate-600 mb-8">
            Tu tienda online moderna con gestión integral de productos, pedidos y usuarios.
          </p>
          <div className="flex gap-4">
            <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Iniciar Sesión
            </a>
            <a href="/register" className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors">
              Crear Cuenta
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Productos</h3>
            <p className="text-slate-500">Explora nuestro catálogo completo de productos.</p>
          </div>
          
          <div className="card">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Compras</h3>
            <p className="text-slate-500">Compra con seguridad y recibe en tu domicilio.</p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Comunidad</h3>
            <p className="text-slate-500">Únete a miles de usuarios satisfechos.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Hola, {user.name}
        </h1>
        <p className="text-slate-500">
          {isAdmin 
            ? "Gestiona tu tienda, productos, pedidos y usuarios desde este panel central." 
            : "Explora nuestros productos y gestiona tus pedidos."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/products" className="card hover:border-blue-200 hover:bg-blue-50/30 group cursor-pointer">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-bold text-lg mb-1">Productos</h3>
          <p className="text-slate-500 text-sm mb-4">
            {isAdmin ? "Gestiona el inventario de la tienda" : "Explora el catálogo de productos"}
          </p>
          <span className="text-blue-600 font-medium text-sm flex items-center gap-1">Ver <ArrowRight className="w-4 h-4" /></span>
        </a>
        
        <a href="/orders" className="card hover:border-green-200 hover:bg-green-50/30 group cursor-pointer">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ShoppingCart className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-bold text-lg mb-1">Pedidos</h3>
          <p className="text-slate-500 text-sm mb-4">
            {isAdmin ? "Gestiona todas las órdenes" : "Revisa el estado de tus compras"}
          </p>
          <span className="text-green-600 font-medium text-sm flex items-center gap-1">Ver <ArrowRight className="w-4 h-4" /></span>
        </a>

        {isAdmin && (
          <a href="/users" className="card border-purple-100 hover:border-purple-200 hover:bg-purple-50/30 group cursor-pointer">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-bold text-lg mb-1">Usuarios</h3>
            <p className="text-slate-500 text-sm mb-4">Control total sobre usuarios y permisos.</p>
            <span className="text-purple-600 font-medium text-sm flex items-center gap-1">Gestionar <ArrowRight className="w-4 h-4" /></span>
          </a>
        )}
      </div>
    </div>
  );
}

