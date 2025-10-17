'use client';

import React, { useState, useEffect } from 'react';
import { Service } from '@/app/utils/definitions';
import { BookingFormData } from '@/app/lib/bookingStore';
import { useAuth } from './AuthContext';

export interface BookingFormProps {
    service: Service;
    selectedDate: Date;
    selectedTime: string;
    onSubmit: (formData: BookingFormData) => void | Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({ service, selectedDate, selectedTime, onSubmit, onCancel, isLoading }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState<BookingFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        paymentMethod: 'wave', // Set default payment method
    });

    useEffect(() => {
        if (user) {
            const nameParts = user.name?.split(' ') || [];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            setFormData({
                firstName: firstName,
                lastName: lastName,
                email: user.email || '',
                phoneNumber: user.phone || '',
                paymentMethod: 'wave', // Ensure payment method is set
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...formData, paymentMethod: 'wave' });
    };

    const formatDate = (date: Date) => {
        // The date from the store is in UTC. To display it correctly in the user's timezone
        // without it shifting, we need to tell toLocaleDateString it's a UTC date.
        return date.toLocaleDateString('fr-FR', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        });
    };

    return (
        <div className="fixed inset-0 bg-[linear-gradient(135deg,#f8e1f4_0%,#fce4ec_100%)] bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full"> {/* Removed max-h-[90vh] and overflow-y-auto */}
                <h2 className="text-2xl font-bold mb-4">Finaliser la réservation</h2>
                
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-lg flex flex-wrap items-center">
                        {(() => {
                            const match = service.name.match(/(.*)\s\((séance|sèance|forfait)\)/i);
                            const baseName = match ? match[1] : service.name;
                            const typeLabel = match ? match[2] : null;
                            return (
                                <>
                                    {baseName}
                                    {typeLabel && (
                                        <span className="ml-2 px-3 py-1 text-xs font-bold text-white bg-pink-500 rounded-full shadow-md cursor-default">
                                            {typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}
                                        </span>
                                    )}
                                </>
                            );
                        })()}
                    </h3>
                    <p className="text-gray-600">{formatDate(selectedDate)}</p>
                    <p className="text-gray-600">Heure: {selectedTime}</p>
                    <p className="text-pink-500 font-bold">{service.price.toLocaleString('fr-FR')} CFA</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                Prénom *
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                required
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                placeholder="Votre prénom"
                            />
                        </div>

                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                Nom de famille *
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                required
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                placeholder="Votre nom de famille"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                placeholder="votre@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Numéro de téléphone *
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                required
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                                placeholder="1 23 45 67 89"
                            />
                        </div>
                    </div>

                    {/* Deposit Information */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                        <p className="text-sm text-blue-800">
                            Pour confirmer votre réservation, un acompte de <strong className="font-bold whitespace-nowrap">15 000 CFA</strong> est requis.
                            Vous serez invité à payer via Wave à l'étape suivante. Le solde sera à régler sur place.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-gray-300 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-400 transition duration-300 font-medium"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-white text-pink-600 border-2 border-pink-600 py-3 px-4 rounded-md hover:bg-pink-600 hover:text-white transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Envoi en cours...' : 'Continuer vers le paiement'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingForm;
