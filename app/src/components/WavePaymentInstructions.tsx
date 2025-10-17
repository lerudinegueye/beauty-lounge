'use client';

import React from 'react';
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

  return (
    <div className="fixed inset-0 bg-[linear-gradient(135deg,#f8e1f4_0%,#fce4ec_100%)] bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-lg w-full text-center max-h-[95vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Payez l'acompte avec Wave</h2>
        <p className="text-gray-600 mb-6">
          Scannez ce QR code pour payer l'acompte de <strong className="text-pink-600 whitespace-nowrap">{depositAmount.toLocaleString('fr-FR')} CFA</strong> et confirmer votre réservation.
        </p>

        {/* Contenitore per il QR Code */}
        <div className="bg-white p-4 border-4 border-pink-500 rounded-lg inline-block mb-6">
          <QRCode
            value={waveDeepLink}
            size={180} // Dimensione del QR code
          />
        </div>

        <p className="text-gray-600 mb-6 text-left">
          Ou envoyez manuellement le paiement au <strong className="font-mono">{wavePhoneNumber}</strong>.
          <br />
          <strong>Important :</strong> Dans la note du transfert, veuillez indiquer votre ID de réservation : <strong className="font-mono text-lg">{bookingId}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-8 text-left">
            Le reste de <strong className="text-gray-700 whitespace-nowrap">{(service.price - depositAmount).toLocaleString('fr-FR')} CFA</strong> sera à régler sur place.
        </p>
        <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg mb-6 text-left">
            Une fois le paiement effectué, votre réservation sera validée par notre équipe. Vous recevrez un e-mail de confirmation final.
        </p>

        <button
          onClick={onClose}
          className="w-full bg-pink-600 text-white font-bold py-3 px-6 rounded-full hover:bg-pink-700 transition-all"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

export default WavePaymentInstructions;