'use client';

import React from 'react';
import Header from './Header';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}