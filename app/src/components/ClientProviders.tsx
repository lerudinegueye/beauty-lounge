'use client';

import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
    </AuthProvider>
  );
}