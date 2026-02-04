// src/app/layout.tsx
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";
import { Home, Package, ShoppingCart, Users, LogIn, UserPlus } from "lucide-react";

export const metadata = {
  title: "E-commerce PrismaStore",
  description: "Panel de administración y tienda online"
  ,
  icons: {
    icon: '/1485477061-cart_78585.svg',
  }
};
 

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  return (
    <html lang="es">
      <body className="min-h-screen flex bg-slate-50">
        <aside className="w-64 border-r border-slate-200 bg-white p-6 hidden md:flex flex-col">
          <div className="flex items-center gap-2 mb-8 px-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-xl text-slate-800 tracking-tight">PrismaStore</h2>
          </div>
          <nav className="space-y-1 flex-1">
            <a href="/" className="nav-link flex items-center gap-2">
              <Home className="w-4 h-4" />
              Inicio
            </a>
            <a href="/products" className="nav-link flex items-center gap-2">
              <Package className="w-4 h-4" />
              Productos
            </a>
            {user && (
              <a href="/orders" className="nav-link flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Pedidos
              </a>
            )}
            {isAdmin && (
              <a href="/users" className="nav-link flex items-center gap-2">
                <Users className="w-4 h-4" />
                Usuarios (Admin)
              </a>
            )}
          </nav>
          
          <div className="mt-auto pt-6 border-t border-slate-100">
            {user ? (
              <div className="px-2">
                <p className="text-xs text-slate-400 mb-1">Conectado como</p>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                    {user.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500">{isAdmin ? 'Administrador' : 'Cliente'}</p>
                  </div>
                </div>
                <LogoutButton />
              </div>
            ) : (
              <div className="space-y-2">
                <a href="/login" className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm w-full">
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </a>
                <a href="/register" className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors text-sm w-full">
                  <UserPlus className="w-4 h-4" />
                  Registrarse
                </a>
              </div>
            )}
          </div>
        </aside>
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8">
            <h1 className="text-sm font-medium text-slate-500">
              {isAdmin ? "Panel de Administrador" : user ? "Portal de Cliente" : "Claridad. Estilo. Calidad."}
            </h1>
          </header>
          <section className="p-8 overflow-auto">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}


