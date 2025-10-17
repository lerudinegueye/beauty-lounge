'use client';

import React from 'react';
import useBookingStore from '@/app/lib/bookingStore';
import { useAuth } from '@/app/src/components/AuthContext';
import Timetable from './Timetable';
import BookingForm from './BookingForm';
import LoginModal from './LoginModal';
import WavePaymentInstructions from './WavePaymentInstructions';

const BookingModals = () => {
  const {
    selectedService,
    selectedDate,
    selectedTime,
    allTimes,
    availableTimes,
    isLoading,
    error,
    bookingSuccess,
    isTimetableOpen,
    isWaveInstructionsOpen,
    waveBookingDetails,
    isBookingFormOpen,
    isLoginModalOpen,
    closeTimetable,
    setSelectedDate,
    openBookingForm,
    submitBooking,
    closeWaveInstructions,
    closeBookingForm,
    closeLoginModal,
  } = useBookingStore();

  const { user } = useAuth();

  return (
    <>
      {isTimetableOpen && selectedService && (
        <div className="fixed inset-0 bg-[linear-gradient(135deg,#f8e1f4_0%,#fce4ec_100%)] bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-4 flex flex-wrap items-center gap-2">
              <span>Réserver:</span>
              {(() => {
                const match = selectedService.name.match(/(.*)\s\((séance|sèance|forfait)\)/i);
                const baseName = match ? match[1].trim() : selectedService.name;
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
            <Timetable
              selectedDate={selectedDate}
              selectedServiceId={selectedService?.id}
              onDateChange={setSelectedDate}
              allTimes={allTimes}
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
          onSubmit={(formData) => submitBooking(formData, user)}
          onCancel={closeBookingForm}
          isLoading={isLoading}
        />
      )}

      {bookingSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
          Réservation effectuée avec succès ! Un e-mail de confirmation a été envoyé.
        </div>
      )}

      {isWaveInstructionsOpen && waveBookingDetails.service && waveBookingDetails.bookingId && (
        <WavePaymentInstructions
          service={waveBookingDetails.service}
          bookingId={waveBookingDetails.bookingId}
          onClose={closeWaveInstructions}
          isLoading={isLoading}
        />
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
    </>
  );
};

export default BookingModals;