import { MenuCards } from './MenuCards';
import React from 'react';
import { getMenu } from '../utils/data';
import Link from 'next/link';

export default async function MenuPage() {
  const menuItems = await getMenu();

  return (
    <main className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-2 px-4 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-all duration-300 ease-in-out">
            Retour
          </Link>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-12 text-center">
          Notre Menu
        </h1>
        {menuItems.length > 0 ? (
          <MenuCards items={menuItems} />
        ) : (
          <p className="text-center text-gray-500">
            Aucun article disponible pour le moment.
          </p>
        )}
      </div>
    </main>
  );
}