'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '../src/components/CartContext';
import { useAuth } from '../src/components/AuthContext';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!user) {
      router.push('/signin?callbackUrl=/cart');
      return;
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cart: cartItems, user }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        console.error('Errore dalla API di checkout:', errorBody);
        return;
      }

      const { id: sessionId } = await response.json();
      if (!sessionId) {
        console.error('ID di sessione non ricevuto dalla API.');
        return;
      }

      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Errore durante il reindirizzamento a Stripe:', error);
        }
      }
    } catch (error) {
      console.error('Errore Stripe nel checkout:', error);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Votre Panier</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">Votre panier est vide.</p>
            <Link href="/menu" className="mt-4 inline-block bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-all">
              Continuer vos achats
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md">
                  <div className="flex-grow">
                    <h2 className="font-semibold text-lg text-gray-800">{item.title}</h2>
                    <p className="text-gray-600">{item.price.toLocaleString('fr-FR', { style: 'currency', currency: 'CFA', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-200 rounded-md">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md transition-colors"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 text-center font-semibold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 border-b pb-4">Résumé</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'CFA', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                  {/* Aggiungi qui eventuali altre voci come spedizione o tasse */}
                </div>
                <div className="flex justify-between font-bold text-lg mt-4 pt-4 border-t">
                  <span>Total</span>
                  <span>{totalPrice.toLocaleString('fr-FR', { style: 'currency', currency: 'CFA', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="mt-6 w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-all duration-300 ease-in-out"
                >
                  Payer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;