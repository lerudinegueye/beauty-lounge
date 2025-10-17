'use client'; // Make it a client component

import React, { useState, useEffect } from 'react'; // Keep React imports
import MenuCards from '../menu/MenuCards'; // Use MenuCards instead
import { useAuth } from '../src/components/AuthContext';
import Link from 'next/link';
import useBookingStore from '../lib/bookingStore';
import BookingModals from '../src/components/BookingModals';
import { Service } from '../utils/definitions';

const CryolipolisiPage = () => {
  const [cryoServices, setCryoServices] = useState<Service[]>([]);
  const [defaultService, setDefaultService] = useState<Service | null>(null);
  const [isFetchingDefault, setIsFetchingDefault] = useState(true);
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

  // Fetch a default Cryolipolyse service to use for the "Prendre Rendez-Vous" button
  useEffect(() => {
    const fetchDefaultService = async () => {
      setIsFetchingDefault(true);
      try {
        const response = await fetch('/api/menu/Cryolipolyse'); // Corrected API endpoint
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data: Service[] = await response.json();
        setCryoServices(data); // Set all cryo services

        if (data.length > 0) {
          setDefaultService(data[0]);
        }
      } catch (err: any) {
        console.error('Failed to fetch default Cryolipolyse service:', err.message);
        // Optionally set an error in a local state if needed for this specific fetch
      } finally {
        setIsFetchingDefault(false);
      }
    };
    fetchDefaultService();
  }, []);

  const handleHeroBookClick = () => {
    if (!user) return openLoginModal();
    if (defaultService && !isFetchingDefault) return openTimetable(defaultService);
    // Handle case where default service isn't loaded
    console.error('No default service available for booking.');
  };

  return (
    <div className="min-h-screen bg-pink-50 text-gray-800">
      {/* Hero Section */}
      <section className="relative bg-pink-100 py-20 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl font-extrabold text-pink-700 mb-4">
            Criolipolisi
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Rimodella il tuo corpo e dì addio al grasso localizzato con la nostra tecnologia di criolipolisi all'avanguardie. Senza dolore né chirurgia.
          </p>
          <button
            onClick={handleHeroBookClick}
            disabled={isFetchingDefault}
            className="bg-white text-pink-600 border-2 border-pink-600 font-bold py-3 px-8 rounded-full hover:bg-pink-600 hover:text-white transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isFetchingDefault ? 'Chargement...' : 'Prendre Rendez-Vous'}
          </button>
        </div>
      </section>

      {/* Key Benefits/Target Areas Section */}
      <section className="container mx-auto px-6 py-16 bg-white shadow-lg rounded-lg -mt-10 relative z-10">
        <h2 className="text-4xl font-bold text-center text-pink-600 mb-12">Des résultats visibles sur les zones les plus tenaces</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-center">
          {['ventre', 'cuisses', 'bras', 'hanches', 'poignées d’amour', 'culotte de cheval'].map((area, index) => (
            <div key={index} className="p-4 bg-pink-50 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <p className="text-lg font-semibold text-gray-700 capitalize">{area}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Personalized Analysis Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="bg-pink-50 rounded-lg shadow-xl p-10 text-center">
          <h2 className="text-4xl font-bold text-pink-600 mb-6">Analyse et diagnostic personnalisés <span className="text-gray-800">Offerts</span></h2>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
            Chez Beauty Lounge, chaque accompagnement débute par un diagnostic 100 % gratuit et une analyse personnalisée de votre silhouette.
            Nous identifions avec précision les zones à traiter grâce à des outils professionnels (photos, mesures, suivi visuel). Cette première étape nous permet de créer un plan de traitement sur-mesure, adapté à vos objectifs.
            Spécialistes de la cryolipolisi, notre équipe d’expertes vous suit tout au long de votre transformation pour garantir des risultati visibles, durables et adaptés à votre morphologie.
          </p>
        </div>
      </section>

      {/* Pricing Section (using ServiceCards) */}
      <section className="container mx-auto px-6 py-12">
        <h2 className="text-4xl font-bold text-center text-pink-600 mb-8">Tarifs Cryolipolisi</h2>
        <div className="flex justify-center">
          {/* Pass the fetched services directly to MenuCards */}
          <MenuCards menu={[{
            name: 'Cryolipolyse',
            menuItems: cryoServices
          }]} />
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="bg-pink-100 py-16 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-pink-700 mb-6">Offres Spéciales</h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Bénéficiez d’une réduction exclusive en parrainant 2 personnes ou découvrez nos promotions saisonnières !
          </p>
          <Link
            href="/"
            className="bg-white text-pink-600 border-2 border-pink-600 font-bold py-3 px-8 rounded-full hover:bg-pink-600 hover:text-white transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105"
          >
            Découvrir les Offres
          </Link>
        </div>
      </section>

      <BookingModals />
    </div>
  );
};

export default CryolipolisiPage;
