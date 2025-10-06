"use client";

import React, { useState } from 'react';
import type { MenuCard } from '../utils/definitions';
import { useCart } from '../src/components/CartContext';
import Modal from '../src/components/Modal';

interface MenuCardsProps {
  items: MenuCard[];
}

const CardItem: React.FC<{ item: MenuCard }> = ({ item }) => {
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCartClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirmAddToCart = () => {
    // L'oggetto passato qui è già corretto, ma lo esplicito per chiarezza
    const cartItem = {
      id: item.id,
      title: item.name, // 'name' viene mappato su 'title'
      price: item.price,
    };
    addToCart(cartItem);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const formatPrice = (price: number) => {
    if (typeof price !== 'number') {
      return 'Prix indisponible';
    }
    return `${price.toLocaleString('fr-FR')} CFA`;
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-2 transition-all duration-300 ease-in-out hover:shadow-xl flex flex-col">
        <div className="p-6 flex-grow flex flex-col">
          <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">{item.name}</h3>
          <p className="text-gray-600 text-center mb-4 flex-grow">{item.description}</p>
          <p className="text-3xl font-bold text-center text-pink-500 my-4">{formatPrice(item.price)}</p>
          <button
            onClick={handleAddToCartClick}
            className="mt-auto bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-all duration-300 ease-in-out w-full"
          >
            Ajouter au panier
          </button>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAddToCart}
        title="Confirmation d'achat"
      >
        <p>Voulez-vous vraiment ajouter <strong>{item.name}</strong> au panier ?</p>
      </Modal>
    </>
  );
};

export const MenuCards: React.FC<MenuCardsProps> = ({ items }) => {
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'Autres';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuCard[]>);

  const categories = Object.keys(groupedItems);
  const [activeTab, setActiveTab] = useState(categories[0]);

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
                <CardItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};