'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/components/AuthContext';
import useBookingStore from '../../lib/bookingStore';
import BookingModals from '../../src/components/BookingModals';
import { Service } from '../../utils/definitions';

interface ServiceCardsProps {
    categoryName: string;
}

const ServiceCards: React.FC<ServiceCardsProps> = ({ categoryName }) => {
    const [services, setServices] = useState<Service[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const { openTimetable, openLoginModal } = useBookingStore();

    const { user } = useAuth();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch(`/api/menu/${categoryName}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setServices(data);
            } catch (error: any) {
                console.error(`Failed to fetch services for category ${categoryName}:`, error);
                setFetchError(error.message);
            }
        };
        fetchServices();
    }, [categoryName]);

    const handleBookClick = (service: Service) => {
        if (!user) return openLoginModal();
        openTimetable(service);
    };

    return (
        <div className="container mx-auto p-4">
            {fetchError && <div className="text-red-500 text-center mb-4">{fetchError}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-between text-center relative">
                        {(() => {
                            // Extract base name and type label (séance / forfait)
                            const match = item.name.match(/(.*)\s\((séance|sèance|forfait)\)/i);
                            const baseName = match ? match[1].trim() : item.name;
                            const typeLabel = match ? match[2] : null;

                            return (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2 flex flex-wrap justify-center items-center gap-2">
                                        <span className="leading-tight">{baseName}</span>
                                        {typeLabel && (
                                            <span className="px-3 py-1 text-xs font-bold text-white bg-pink-500 rounded-full shadow-md cursor-default">
                                                {typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}
                                            </span>
                                        )}
                                    </h2>
                                    {item.description && (
                                        <p className="text-gray-700 mb-4">
                                            {item.description.replace(/ à la séance\.$/i, '.')}
                                        </p>
                                    )}
                                </div>
                            );
                        })()}
                        <div className="flex flex-col items-center mt-4">
                            <span className="text-3xl font-extrabold text-gray-800 mb-4">{item.price.toLocaleString('fr-FR')} CFA</span>
                            <button
                                onClick={() => handleBookClick(item)}
                                className="bg-pink-500 text-white px-6 py-3 rounded-full hover:bg-pink-600 transition duration-300 shadow-md"
                            >
                                Prendre Rendez-Vous
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <BookingModals />
        </div>
    );
};

export default ServiceCards;
