'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="text-center mb-12">
        <Image
          src="/logo.jpg"
          alt="Beauty Lounge Logo"
          width={150}
          height={150}
          className="mx-auto"
        />
        <h1 className="text-4xl font-bold text-pink-500 mt-4">Beauty Lounge</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/cryolipolisi"> {/* CORREZIONE: da cryolipolyse a cryolipolisi */}
          <div className="bg-gradient-to-br from-pink-400 to-orange-300 p-8 rounded-lg shadow-lg text-white text-center cursor-pointer transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-2xl font-bold">Cryolipolyse</h2>
            <p>Affinez votre silhouette par le froid.</p>
          </div>
        </Link>
        <Link href="/menu">
          <div className="bg-gradient-to-br from-orange-300 to-pink-400 p-8 rounded-lg shadow-lg text-white text-center cursor-pointer transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-2xl font-bold">Menu</h2>
            <p>Découvrez toutes nos prestations.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
