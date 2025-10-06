'use client';

import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useRouter, usePathname } from 'next/navigation';

const protectedRoutes = ['/profile', '/orders']; // Aggiungi qui altre rotte da proteggere

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      // Protegge solo le rotte specificate, escludendo /cart
      if (protectedRoutes.includes(pathname)) {
        router.push(`/signin?callbackUrl=${pathname}`);
      }
    }
  }, [isLoading, user, router, pathname]);

  if (isLoading && protectedRoutes.includes(pathname)) {
    return <div>Loading...</div>; // O uno spinner di caricamento
  }

  return <>{children}</>;
}