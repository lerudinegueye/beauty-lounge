"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const Header = () => {
  const { user, logout, isLoading } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isPrestationsMenuOpen, setIsPrestationsMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  const prestationsLinks = [
    { href: '/menu/Cryolipolyse', label: 'Cryolipolyse' },
    { href: '/menu/Epilation', label: 'Epilation définitive' },
    { href: '/menu/Manucure', label: 'Manucure' }, // New category link
    { href: '/menu/Nez', label: 'Soins du nez' },
    { href: '/menu/Soins du visage', label: 'Soins du visage' },
    { href: '/menu/Pieds', label: 'Soins des pieds' },
  ];

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { label: 'Nos Prestations', isDropdown: true, subLinks: prestationsLinks },
    { href: '/localisation', label: 'Localisation' },
    { href: '/contact', label: 'Nous contacter' },
    // { href: '/blog', label: 'Blog' }, // Hidden for now
  ];

  return (
  <header className="sticky top-0 z-50 bg-white shadow-md h-16 md:h-20 lg:h-24 xl:h-28">
      <div className="h-full container mx-auto flex items-center justify-between px-2 sm:px-3 md:px-4">
        {/* Col 1: Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="h-full flex items-center" aria-label="BeautyLounge Accueil">
            <Image
              src="/logo.jpg"
              alt="Beauty Lounge Logo"
              width={120}
              height={120}
              priority
              className="h-12 md:h-16 lg:h-20 xl:h-24 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Col 2: Navigation Links */}
  <nav className="hidden md:flex items-center space-x-6 xl:space-x-8">
          {navLinks.map((link) => {
            if (link.isDropdown) {
              return (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => setIsPrestationsMenuOpen(true)}
                  onMouseLeave={() => setIsPrestationsMenuOpen(false)}
                >
                  <div
                    className={`font-semibold text-gray-800 hover:text-pink-500 transition-colors duration-300 flex items-center cursor-pointer ${
                      pathname === '/menu' || link.subLinks.some(subLink => pathname.startsWith(subLink.href)) ? 'text-pink-500' : ''
                    }`}
                  >
                    {link.label}
                    <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform duration-300 ${isPrestationsMenuOpen ? 'rotate-180' : ''}`} />
                  </div>
                  {isPrestationsMenuOpen && (
                    <div className="absolute left-0 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      {link.subLinks.map((subLink) => (
                        <Link
                          key={subLink.href}
                          href={subLink.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {subLink.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else if (link.href) { // Ensure href exists for non-dropdown links
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-semibold text-gray-800 hover:text-pink-500 transition-colors duration-300 ${
                    pathname === link.href ? 'text-pink-500' : ''
                  }`}
                >
                  {link.label}
                </Link>
              );
            }
            return null; // Should not happen if navLinks are well-defined, but for safety
          })}
        </nav>

        {/* Col 3: Actions */}
  <div className="flex-shrink-0 flex items-center space-x-3 md:space-x-4">
          {/* Phone Number */}
          <a href="tel:+221789907905" className="text-gray-600 hover:text-pink-500 transition-colors duration-300 font-semibold text-lg lg:text-xl hidden sm:block">
            +221789907905
          </a>

          {isLoading ? (
            <span className="text-gray-600">...</span>
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2"
              >
                <UserCircleIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-9 lg:w-9 xl:h-10 xl:w-10 text-gray-600" />
                <span className="hidden sm:inline font-semibold text-gray-800">{user.name}</span>
                <ChevronDownIcon
                  className={`h-5 w-5 text-gray-600 transition-transform duration-300 ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  {user.isAdmin && (
                    <>
                      <Link
                        href="/admin/bookings"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Gérer les réservations
                      </Link>
                      <Link
                        href="/admin/availabilities"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)} // Close menu on click
                      >
                        Gérer les disponibilités
                      </Link>
                      <Link
                        href="/admin/menu-items"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)} // Close menu on click
                      >
                        Ajouter une prestation
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/signin" className="bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-2 px-4 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-all duration-300 ease-in-out">
                Connexion
              </Link>
              <Link href="/signup" className="bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-2 px-4 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-all duration-300 ease-in-out">
                Inscription
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
