'use client';

import React, { useState } from 'react';
import { Service } from '@/app/utils/definitions';

export interface BookingFormProps {
    service: Service;
    selectedDate: Date;
    selectedTime: string;
    onSubmit: (formData: BookingFormData) => void;
    onCancel: () => void;
    isLoading: boolean;
}

export interface BookingFormData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

const BookingForm: React.FC<BookingFormProps> = ({ service, selectedDate, selectedTime, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState<BookingFormData>({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 bg-pink-100 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full"> {/* Removed max-h-[90vh] and overflow-y-auto */}
                <h2 className="text-2xl font-bold mb-4">Finaliser la réservation</h2>
                
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-lg flex flex-wrap items-center">
                        {(() => {
                            const match = service.name.match(/(.*)\s\((séance|forfait)\)/);
                            const baseName = match ? match[1] : service.name;
                            const typeLabel = match ? `à ${match[2]}` : null; // Prepend "à "
                            return (
                                <>
                                    {baseName}
                                    {typeLabel && (
                                        <span className="ml-2 px-2 py-1 text-sm font-semibold text-white bg-pink-500 rounded-full">
                                            {typeLabel}
                                        </span>
                                    )}
                                </>
                            );
                        })()}
                    </h3>
                    <p className="text-gray-600">{formatDate(selectedDate)}</p>
                    <p className="text-gray-600">Heure: {selectedTime}</p>
                    <p className="text-pink-500 font-bold">{service.price}€</p>
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
                            className="flex-1 bg-pink-500 text-white py-3 px-4 rounded-md hover:bg-pink-600 transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Envoi en cours...' : 'Confirmer la réservation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingForm;
