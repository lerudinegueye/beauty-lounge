'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useRouter } from 'next/navigation';

const Header = () => {
  const { user, logout, isLoading } = useAuth();
  const { cartItems } = useCart();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          BeautyLounge
        </Link>
        <nav className="flex items-center space-x-4">
          
          {/* I link "Menu" e "Cryolipolisi" sono stati rimossi come richiesto */}
          
          {isLoading ? (
            <span className="text-gray-600">...</span>
          ) : user ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-800 font-semibold">Hi, {user.name}</span>
              <button onClick={handleLogout} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Logout</button>
            </div>
          ) : (
            // --- Pulsanti Login/Sign Up con nuovo stile ---
            <>
              <Link href="/signin" className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">
                Login
              </Link>
              <Link href="/signup" className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">
                Sign Up
              </Link>
            </>
          )}

          {/* --- Icona carrello spostata alla fine --- */}
          <Link href="/cart" className="relative text-gray-600 hover:text-gray-800">
            <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{totalItems}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;