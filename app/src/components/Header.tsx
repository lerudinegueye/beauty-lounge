'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext'; // Importa useAuth
import { useCart } from './CartContext';
import { UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const Header = () => {
  const { user, logout, isLoading } = useAuth(); // Corretto da "loading" a "isLoading"
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { cartItems } = useCart();

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md h-24">
      <div className="h-full flex items-center justify-between px-4">
        {/* Col 1: Logo */}
        <div className="flex justify-start">
          <Link href="/" className="h-full flex items-center">
            <img
              src="/logo.jpg"
              alt="BeautyLounge Logo"
              className="h-20 object-contain"
            />
          </Link>
        </div>

        {/* Col 2: Actions */}
        <div className="flex justify-end items-center space-x-4">
          <Link href="/cart" className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {isLoading ? (
            <span className="text-gray-600">...</span>
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2"
              >
                <UserCircleIcon className="h-8 w-8 text-gray-600" />
                <span className="font-medium text-gray-600">{user.name}</span>
                <ChevronDownIcon
                  className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${
                    isMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/signin" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link href="/signup" className="text-gray-600 hover:text-gray-900">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;