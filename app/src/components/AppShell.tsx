'use client';

import React from 'react';
import Header from './Header';
import Footer from './Footer';

const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8" style={{ background: 'linear-gradient(135deg, #f8e1f4 0%, #fce4ec 100%)' }}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AppShell;
