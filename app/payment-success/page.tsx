'use client';

import { useEffect } from 'react';
import { useCart } from '@/src/components/CartContext';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const PaymentSuccessPage = () => {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Paiement réussi !</h1>
          <p className="text-gray-600 mb-6">
            Merci pour votre commande. Vous recevrez bientôt un e-mail de confirmation.
          </p>
          <Link href="/menu" className="inline-block bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-all">
            Continuer vos achats
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;