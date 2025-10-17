'use client';

import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus, PaymentConfirmationStatus } from '@/app/utils/definitions';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onUpdate: (bookingId: number, data: Partial<Booking>) => void;
  onDelete: (bookingId: number) => void;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onUpdate,
  onDelete,
}) => {
  const [status, setStatus] = useState<BookingStatus>('pending');
  const [paymentConfirmation, setPaymentConfirmation] = useState<PaymentConfirmationStatus>('pending');
  const [notes, setNotes] = useState<string | null>(null);

  useEffect(() => {
    if (booking) {
      setStatus(booking.status);
      setPaymentConfirmation(booking.payment_confirmation);
      setNotes(booking.notes);
    }
  }, [booking]);

  if (!isOpen || !booking) {
    return null;
  }

  const handleSave = () => {
    const updatedData: Partial<Booking> = {
      status,
      payment_confirmation: paymentConfirmation,
      notes,
    };
    onUpdate(booking.id, updatedData);
    onClose();
  };

  const handleDeleteClick = () => {
    onDelete(booking.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Modifier la réservation</h2>
        
        <div className="space-y-4">
          <div>
            <p className="font-semibold">Client:</p>
            <p>{`${booking.customer_first_name} ${booking.customer_last_name}`}</p>
            <p className="text-sm text-gray-600">{booking.customer_email}</p>
          </div>
          <div>
            <p className="font-semibold">Rendez-vous:</p>
            <p>{format(new Date(booking.start_time), 'PPP HH:mm', { locale: fr })}</p>
          </div>
          <div>
            <p className="font-semibold">Service:</p>
            <p>{booking.menu_items.name}</p>
          </div>
          
          <div className="border-t pt-4">
            <label htmlFor="status" className="block font-semibold text-gray-700">Statut de la réservation</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmé</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <div>
            <label htmlFor="payment_confirmation" className="block font-semibold text-gray-700">Confirmation du paiement de l'acompte</label>
            <select
              id="payment_confirmation"
              value={paymentConfirmation || 'pending'}
              onChange={(e) => setPaymentConfirmation(e.target.value as PaymentConfirmationStatus)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="pending">Acompte à vérifier</option>
              <option value="confirmed">Acompte payé</option>
              <option value="not_applicable">Non applicable</option>
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block font-semibold text-gray-700">Notes</label>
            <textarea
              id="notes"
              value={notes || ''}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              rows={3}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
          >
            Enregistrer
          </button>
        </div>
        <div className="mt-4 border-t pt-4">
            <button
                onClick={handleDeleteClick}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
                Supprimer la réservation
            </button>
        </div>
      </div>
    </div>
  );
};

export default EditBookingModal;
