"use client";

import React, { useState } from 'react';
import type { MenuCard } from '../utils/definitions';
import { useCart } from '../src/components/CartContext';
import Modal from '../src/components/Modal';
import { useAuth } from '../src/components/AuthContext';
import { useRouter } from 'next/navigation';

interface MenuCardsProps {
  items: MenuCard[];
}

const CardItem: React.FC<{ 
  item: MenuCard; 
  onBookingClick: (item: MenuCard) => void;
  onAddToCartClick: (item: MenuCard) => void;
}> = ({ item, onBookingClick, onAddToCartClick }) => {

  const formatPrice = (price: number) => {
    if (typeof price !== 'number') {
      return 'Prix indisponible';
    }
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(price);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300 p-6 w-full max-w-xs">
      <h3 className="text-xl font-bold mb-2 text-gray-800 text-center">{item.name}</h3>
      <p className="mb-4 text-gray-600 text-center flex-grow">{item.description}</p>
      <p className="text-lg font-semibold text-center mb-4">{formatPrice(item.price)}</p>
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => onAddToCartClick(item)}
          className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-teal-500 transition-all duration-300 ease-in-out w-full text-center"
        >
          Ajouter au panier
        </button>
        <button
          onClick={() => onBookingClick(item)}
          className="bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-all duration-300 ease-in-out w-full text-center"
        >
          Réservez
        </button>
      </div>
    </div>
  );
};

export const MenuCards: React.FC<MenuCardsProps> = ({ items }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<MenuCard | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    bookingDate?: string;
    bookingTime?: string;
    phone?: string;
    email?: string;
  }>({});

  const handleBookingClick = (card: MenuCard) => {
    setSelectedCard(card);
    setIsBookingModalOpen(true);
  };

  const handleAddToCartClick = (card: MenuCard) => {
    setSelectedCard(card);
    setIsAddToCartModalOpen(true);
  };

  const handleConfirmAddToCart = () => {
    if (selectedCard) {
      addToCart({
        id: selectedCard.id,
        title: selectedCard.name,
        price: selectedCard.price,
      });
    }
    setIsAddToCartModalOpen(false);
    setSelectedCard(null);
  };

  const handleBookingSubmit = async () => {
    const newErrors: typeof errors = {};
    if (!firstName) newErrors.firstName = 'Le prénom est requis.';
    if (!lastName) newErrors.lastName = 'Le nom est requis.';
    if (!bookingDate) newErrors.bookingDate = 'La date est requise.';
    if (!bookingTime) newErrors.bookingTime = "L'heure est requise.";
    if (!/^\d{9,15}$/.test(phoneNumber)) {
      newErrors.phone = 'Veuillez entrer un numéro de téléphone valide.';
    }
    if (!user && !email) {
      newErrors.email = "L'email est requis.";
    } else if (!user && email && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "L'adresse email n'est pas valide.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (selectedCard) {
      try {
        const response = await fetch('/api/send-booking-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardTitle: selectedCard.name,
            cardPrice: selectedCard.price,
            customerEmail: user ? user.email : email,
            phoneNumber,
            firstName,
            lastName,
            bookingDate,
            bookingTime,
          }),
        });

        if (!response.ok) throw new Error('La requête de réservation a échoué');
        
        console.log('E-mail de réservation envoyé avec succès !');
        setIsBookingModalOpen(false);
        setIsSuccessModalOpen(true);
      } catch (error) {
        console.error("Erreur lors de l'envoi de la réservation :", error);
      }
    }
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedCard(null);
    setPhoneNumber('');
    setFirstName('');
    setLastName('');
    setBookingDate('');
    setBookingTime('');
    setEmail('');
    setErrors({});
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setSelectedCard(null);
    setPhoneNumber('');
    setFirstName('');
    setLastName('');
    setBookingDate('');
    setBookingTime('');
    setErrors({});
  };

  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Autres';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuCard[]>);

  const categories = Object.keys(groupedItems);
  const [activeTab, setActiveTab] = useState(categories[0] || '');

  return (
    <div>
      <div className="flex justify-center mb-8 bg-gray-100 rounded-lg p-1">
        {categories.map((category) => (
          <button
            key={category}
            className={`px-4 py-2 text-lg font-medium transition-colors duration-300 ease-in-out rounded-md ${
              activeTab === category
                ? 'bg-white text-pink-500 shadow'
                : 'text-gray-600 hover:bg-white/50'
            }`}
            onClick={() => setActiveTab(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div>
        {Object.entries(groupedItems).map(([category, categoryItems]) => (
          <div key={category} className={activeTab === category ? 'block' : 'hidden'}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {categoryItems.map((item) => (
                <CardItem 
                  key={item.id} 
                  item={item} 
                  onBookingClick={handleBookingClick}
                  onAddToCartClick={handleAddToCartClick} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {isAddToCartModalOpen && selectedCard && (
        <Modal
          isOpen={isAddToCartModalOpen}
          onClose={() => setIsAddToCartModalOpen(false)}
          onConfirm={handleConfirmAddToCart}
          title="Confirmation d'ajout"
          confirmText="Confirmer"
        >
          <p>Voulez-vous vraiment ajouter <strong>{selectedCard.name}</strong> au panier ?</p>
        </Modal>
      )}

      {isBookingModalOpen && selectedCard && (
        <Modal
          isOpen={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          onConfirm={handleBookingSubmit}
          title={`Réserver: ${selectedCard.name}`}
          confirmText="Confirmer la réservation"
        >
          <div className="space-y-4">
            {!user && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" required />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            )}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Prénom</label>
              <input type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" required />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Nom</label>
              <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" required />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Numéro de téléphone</label>
              <input type="tel" id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" required />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="bookingDate" className="block text-sm font-medium text-gray-700">Date du traitement</label>
              <input type="date" id="bookingDate" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" required />
              {errors.bookingDate && <p className="text-red-500 text-xs mt-1">{errors.bookingDate}</p>}
            </div>
            <div>
              <label htmlFor="bookingTime" className="block text-sm font-medium text-gray-700">Heure du traitement</label>
              <input type="time" id="bookingTime" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" required />
              {errors.bookingTime && <p className="text-red-500 text-xs mt-1">{errors.bookingTime}</p>}
            </div>
          </div>
        </Modal>
      )}

      {isSuccessModalOpen && (
        <Modal
          isOpen={isSuccessModalOpen}
          onClose={handleCloseSuccessModal}
          onConfirm={handleCloseSuccessModal}
          title="Réservation réussie !"
          confirmText="OK"
        >
          <p>Votre demande de réservation a été envoyée avec succès. Vous serez contacté(e) sous peu pour la confirmation.</p>
        </Modal>
      )}
    </div>
  );
};