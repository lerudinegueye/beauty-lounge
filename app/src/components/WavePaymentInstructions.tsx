'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Service } from '@/app/utils/definitions';
import QRCode from 'react-qr-code';

interface WavePaymentInstructionsProps {
  service: Service;
  bookingId: number;
  onClose: () => void;
  isLoading: boolean;
}

const WavePaymentInstructions: React.FC<WavePaymentInstructionsProps> = ({ service, bookingId, onClose, isLoading }) => {
  // Leggiamo il numero di telefono dalle variabili d'ambiente per renderlo configurabile
  const wavePhoneNumber = process.env.NEXT_PUBLIC_WAVE_PHONE_NUMBER || "221789907905";
  const depositAmount = 15000; // Importo fisso dell'acconto

  // Costruiamo il deep link per il pagamento Wave
  const waveDeepLink = `wave://send?phone=${wavePhoneNumber.replace(/\s/g, '')}&amount=${depositAmount}&message=${encodeURIComponent(`Acompte Réservation #${bookingId}`)}`;

  const [paymentDetected, setPaymentDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // When payment is detected, stop polling and auto-close after a short delay
  useEffect(() => {
    if (paymentDetected) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const t = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [paymentDetected, onClose]);

  // Poll booking payment status every 6s
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (!res.ok) return; // Ignore errors; keep polling
        const data = await res.json();
        if (!cancelled) {
          if (data?.payment_confirmation === 'confirmed' || data?.status === 'confirmed') {
            setPaymentDetected(true);
            // Optionally auto-close after a short delay
            // setTimeout(onClose, 1200);
          }
        }
      } catch (e: any) {
        if (!cancelled) setError('Impossible de vérifier le paiement pour le moment.');
      }
    };
    intervalRef.current = setInterval(poll, 6000);
    // fire first immediately
    poll();
    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [bookingId]);

  return (
    <div className="fixed inset-0 bg-[linear-gradient(135deg,#f8e1f4_0%,#fce4ec_100%)] bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl max-w-lg w-full text-center relative">
        <button
          onClick={onClose}
          className="absolute left-3 top-2 inline-flex items-center gap-1 text-pink-500 hover:text-orange-400 font-semibold px-1 py-1"
          aria-label="Retour"
        >
          <span aria-hidden>&larr;</span>
          <span>Retour</span>
        </button>
        <div className="mb-4">
          <h2 className="mt-2 sm:mt-3 w-full text-center text-lg sm:text-xl md:text-2xl font-bold text-gray-800 whitespace-nowrap">
            Payez l'acompte avec Wave
          </h2>
        </div>
        <p className="text-gray-600 mb-4">
          Scannez ce QR code pour payer l'acompte de <strong className="text-pink-600 whitespace-nowrap">{depositAmount.toLocaleString('fr-FR')} CFA</strong> et confirmer votre réservation.
        </p>

        {/* Contenitore per il QR Code */}
        <div className="bg-white p-3 border-4 border-pink-500 rounded-lg inline-block mb-4">
          <QRCode
            value={waveDeepLink}
            size={160} // Dimensione ridotta per evitare scroll
          />
        </div>

        <p className="text-gray-600 mb-4 text-left">
          Ou envoyez manuellement le paiement au <strong className="font-mono">{wavePhoneNumber}</strong>.
          <br />
          <strong>Important :</strong> Dans la note du transfert, veuillez indiquer votre ID de réservation : <strong className="font-mono text-lg">{bookingId}</strong>
        </p>
        {(() => {
          const remainder = Math.max(0, (service.price ?? 0) - depositAmount);
          if (remainder <= 0) return null;
          return (
            <p className="text-sm text-gray-500 mb-4 text-left">
              Le reste de <strong className="text-gray-700 whitespace-nowrap">{remainder.toLocaleString('fr-FR')} CFA</strong> sera à régler sur place.
            </p>
          );
        })()}
        <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg mb-4 text-left">
            Une fois le paiement effectué, votre réservation sera validée par notre équipe. Vous recevrez un e-mail de confirmation final.
        </p>

        {paymentDetected && (
          <div className="mb-4 rounded-md bg-green-50 border border-green-200 text-green-700 px-4 py-3">
            Paiement détecté. Merci ! Nous confirmons votre réservation.
            <div className="text-xs text-green-700 mt-1">Fermeture automatique…</div>
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3">
            {error}
          </div>
        )}

        {/* Close button removed per request; modal will auto-close after payment detection */}
      </div>
    </div>
  );
};

export default WavePaymentInstructions;