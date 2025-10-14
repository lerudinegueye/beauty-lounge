'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import Timetable from './Timetable';
import LoginModal from './LoginModal';
import BookingForm, { BookingFormData, Cryolipolisi } from './BookingForm';
import Modal from './Modal';

const Booking: React.FC = () => {
    const [services, setServices] = useState<Cryolipolisi[]>([]);
    const [selectedService, setSelectedService] = useState<Cryolipolisi | null>(null);
    const [showTimetable, setShowTimetable] = useState(false);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    const { user } = useAuth();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('/api/cryolipolisi');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setServices(data);
            } catch (error) {
                console.error('Failed to fetch services:', error);
            }
        };
        fetchServices();
    }, []);

    const handleBookClick = (service: Cryolipolisi) => {
        if (!user) {
            setIsLoginModalOpen(true);
        } else {
            setSelectedService(service);
            setShowTimetable(true);
            fetchAvailableTimes(service.id, selectedDate);
        }
    };

    const fetchAvailableTimes = async (serviceId: number, date: Date) => {
        setIsLoading(true);
        setError(null);
        try {
            const formattedDate = date.toISOString().split('T')[0];
            const response = await fetch(`/api/availabilities?serviceId=${serviceId}&date=${formattedDate}&serviceType=cryolipolisi`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Network response was not ok');
            }
            const data = await response.json();
            setAvailableTimes(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        if (selectedService) {
            fetchAvailableTimes(selectedService.id, date);
        }
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        setShowTimetable(false);
        setShowBookingForm(true);
    };

    const handleBookingFormSubmit = async (formData: BookingFormData) => {
        if (selectedService) {
            const [hours, minutes] = selectedTime.split(':');
            const bookingDateTime = new Date(selectedDate);
            bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

            const bookingData = {
                serviceId: selectedService.id,
                serviceType: 'cryolipolisi',
                startTime: bookingDateTime.toISOString(),
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
            };

            try {
                setIsLoading(true);
                const response = await fetch('/api/bookings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingData),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Booking failed');
                }

                setBookingSuccess(true);
                setShowBookingForm(false);
                setTimeout(() => setBookingSuccess(false), 5000);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleBookingFormCancel = () => {
        setShowBookingForm(false);
        setSelectedTime('');
    };

    const openBookingModal = () => {
        setIsBookingModalOpen(true);
    }

    const closeBookingModal = () => {
        setIsBookingModalOpen(false);
    }

    return (
        <>
            <button
                onClick={openBookingModal}
                className="bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-2 px-4 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-all duration-300 ease-in-out"
            >
                Prenez rendez-vous
            </button>

            <Modal isOpen={isBookingModalOpen} onClose={closeBookingModal} title="Choisissez un service">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
                                <p className="text-gray-700 mb-4">{item.description}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-pink-500">{item.price}€</span>
                                <button
                                    onClick={() => handleBookClick(item)}
                                    className="bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition duration-300"
                                >
                                    Réserver
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>

            {showTimetable && selectedService && (
                <Modal isOpen={showTimetable} onClose={() => setShowTimetable(false)} title={`Réserver : ${selectedService.title}`}>
                    <Timetable
                        selectedDate={selectedDate}
                        onDateChange={handleDateChange}
                        availableTimes={availableTimes}
                        onTimeSelect={handleTimeSelect}
                        isLoading={isLoading}
                        error={error}
                    />
                </Modal>
            )}

            {showBookingForm && selectedService && (
                <BookingForm
                    service={selectedService}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onSubmit={handleBookingFormSubmit}
                    onCancel={handleBookingFormCancel}
                    isLoading={isLoading}
                />
            )}

            {bookingSuccess && (
                <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
                    Réservation effectuée avec succès !
                </div>
            )}

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </>
    );
};

export default Booking;
