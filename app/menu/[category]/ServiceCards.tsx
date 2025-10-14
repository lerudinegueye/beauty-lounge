'use client';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/components/AuthContext';
import Timetable from '../../src/components/Timetable';
import LoginModal from '../../src/components/LoginModal';
import BookingForm from '../../src/components/BookingForm';
import useBookingStore from '../../utils/bookingStore';
import { Service } from '../../utils/definitions';

interface ServiceCardsProps {
    categoryName: string;
}

const ServiceCards: React.FC<ServiceCardsProps> = ({ categoryName }) => {
    const [services, setServices] = useState<Service[]>([]);
    const [fetchError, setFetchError] = useState<string | null>(null);
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
                    <div key={item.id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-between text-center relative"> {/* Added relative for positioning */}
                        {(() => {
                            // Correctly parse the name to remove parentheses and create a clean title.
                            const name = item.name.replace(/\((séance|sèance|forfait)\)/i, '$1').trim();

                            return (
                                <>
                                    <div>
                                        <h2 className="text-2xl font-bold text-pink-600 mb-2 flex flex-wrap justify-center items-center">
                                            {name}
                                        </h2>
                                        {item.description && <p className="text-gray-700 mb-4">{item.description}</p>}
                                    </div>
                                </>
                            );
                        })()}
                        <div className="flex flex-col items-center mt-4">
                            <span className="text-3xl font-extrabold text-gray-800 mb-4">{item.price} CFA</span>
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

            {isTimetableOpen && selectedService && (
                <div className="fixed inset-0 bg-pink-50 bg-opacity-90 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full">
                        <h2 className="text-2xl font-bold mb-4">Réserver : {selectedService.name}</h2>
                        <Timetable
                            selectedDate={selectedDate}
                            onDateChange={setSelectedDate}
                            availableTimes={availableTimes}
                            onTimeSelect={openBookingForm}
                            isLoading={isLoading}
                            error={error}
                        />
                        <button
                            onClick={closeTimetable}
                            className="mt-4 bg-gray-300 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-400 transition duration-300"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}

            {isBookingFormOpen && selectedService && (
                <BookingForm
                    service={selectedService}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onSubmit={submitBooking}
                    onCancel={closeBookingForm}
                    isLoading={isLoading}
                />
            )}

            {bookingSuccess && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
                    Réservation effectuée avec succès ! Un e-mail de confirmation a été envoyé.
                </div>
            )}

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={closeLoginModal}
            />
        </div>
    );
};

export default ServiceCards;
