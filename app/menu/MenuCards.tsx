'use client';

import { useState } from 'react';
import { useAuth } from '../src/components/AuthContext';
import useBookingStore from '../lib/bookingStore';
import { Service } from '../utils/definitions';
import BookingModals from '../src/components/BookingModals';

interface Category {
  name: string;
  menuItems: Service[];
}

const MenuCards: React.FC<{ menu: Category[] }> = ({ menu }) => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const {
    selectedService,
    selectedDate,
    selectedTime,
    availableTimes,
    isLoading,
    error,
    bookingSuccess,
    isTimetableOpen,
    isBookingFormOpen,
    isLoginModalOpen,
    openTimetable,
    closeTimetable,
    openLoginModal,
    closeLoginModal,
    setSelectedDate,
    openBookingForm,
    submitBooking,
    closeBookingForm,
  } = useBookingStore();

  const { user } = useAuth();

  const handleBookClick = (service: Service) => {
    if (!user) {
      openLoginModal();
    } else {
      openTimetable(service);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Tabs per le categorie */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {menu.map((category, index) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(index)}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                selectedCategory === index
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Card dei servizi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menu[selectedCategory]?.menuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2 flex flex-wrap items-center justify-center gap-2">
                {(() => {
                  const match = item.name.match(/(.*)\s\((séance|sèance|forfait)\)/i);
                  const baseName = match ? match[1].trim() : item.name;
                  const typeLabel = match ? match[2] : null;
                  return (
                    <>
                      <span className="leading-tight">{baseName}</span>
                      {typeLabel && (
                        <span className="px-3 py-1 text-xs font-bold text-white bg-pink-500 rounded-full shadow-md cursor-default">
                          {typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}
                        </span>
                      )}
                    </>
                  );
                })()}
              </h2>
              <p className="text-gray-700">
                {/* Remove "à la séance" from description if it exists */}
                {item.description?.replace(/ à la séance\.$/i, '.') || 'Nessuna descrizione disponibile'}
              </p>
            </div>
            <div className="flex flex-col items-center mt-4">
              <span className="text-2xl font-bold text-pink-500 mb-4">{item.price.toLocaleString('fr-FR')} CFA</span>
              <button
                onClick={() => handleBookClick(item)}
                className="w-full bg-white text-pink-600 border-2 border-pink-600 font-bold py-3 px-6 rounded-full hover:bg-pink-600 hover:text-white transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105"
              >
                Prendre rendez-vous
              </button>
            </div>
          </div>
        ))}
      </div>

      <BookingModals />
    </div>
  );
};

export default MenuCards;