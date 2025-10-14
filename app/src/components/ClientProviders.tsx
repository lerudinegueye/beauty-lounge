'use client';

import { AuthProvider } from './AuthContext';
// import { CartProvider } from './CartContext'; // Removed as cart functionality is gone

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* <CartProvider>{children}</CartProvider> */}
      {children}
    </AuthProvider>
  );
}
