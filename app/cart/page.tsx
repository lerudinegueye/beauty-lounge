'use client';

import Link from 'next/link';

export default function CartPage() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Panier désactivé</h1>
          <p className="text-gray-600 mb-6">
            Le paiement via Stripe n’est plus disponible. Pour réserver un service, utilisez le flux de réservation
            avec acompte Wave indiqué dans la page du service.
          </p>
          <Link href="/menu" className="inline-block bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-all">
            Voir les services
          </Link>
        </div>
      </div>
    </div>
  );
}