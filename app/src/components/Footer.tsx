'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
const Footer = () => {
  const pathname = usePathname();

  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4 text-center">
      </div>
    </footer>
  );
};

export default Footer;
