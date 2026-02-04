'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import ConfirmDialog from './Confirm';

export function LogoutButton() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleLogout = () => {
    const form = document.getElementById('logoutForm') as HTMLFormElement;
    form?.submit();
  };

  return (
    <>
      <form action="/api/logout" method="POST" className="w-full" id="logoutForm">
        <button 
          type="button" 
          className="text-xs text-red-500 hover:text-red-600 font-medium w-full text-left flex items-center gap-2 hover:bg-red-50 px-2 py-1 rounded transition-colors"
          onClick={() => setShowConfirmDialog(true)}
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </form>

      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Cerrar sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        onConfirm={handleLogout}
        onCancel={() => setShowConfirmDialog(false)}
        confirmText="Cerrar sesión"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
}
