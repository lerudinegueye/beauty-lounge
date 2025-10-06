"use client";

import React, { useState } from 'react';
import type { CryolipolisiCard } from '../utils/definitions';
import { useCart } from '../src/components/CartContext';
import Modal from '../src/components/Modal';

interface CryolipolisiCardsProps {
  cards: CryolipolisiCard[];
}

export const CryolipolisiCards: React.FC<CryolipolisiCardsProps> = ({ cards }) => {
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CryolipolisiCard | null>(null);

  const handleAddToCartClick = (card: CryolipolisiCard) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleConfirmAddToCart = () => {
    if (selectedCard) {
      addToCart({
        id: selectedCard.id,
        title: selectedCard.title,
        price: selectedCard.price,
      });
    }
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('fr-FR')} CFA`;
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map((card) => (
          <div key={card.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300">
            <div className="p-6 flex-grow flex flex-col">
              <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">{card.title}</h2>
              <p className="text-gray-600 text-center mb-4 flex-grow">{card.description}</p>
              <p className="text-3xl font-bold text-center text-pink-500 my-4">{formatPrice(card.price)}</p>
              <button
                onClick={() => handleAddToCartClick(card)}
                className="mt-auto bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-all duration-300 ease-in-out w-full"
              >
                Acheter
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedCard && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmAddToCart}
          title="Confirmation d'achat"
        >
          <p>Voulez-vous vraiment ajouter <strong>{selectedCard.title}</strong> au panier ?</p>
        </Modal>
      )}
    </>
  );
};