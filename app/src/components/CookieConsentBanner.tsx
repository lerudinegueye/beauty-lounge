'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CookieConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-between items-center z-50">
      <p className="text-sm">
        Utilizziamo i cookie per migliorare la tua esperienza. Per saperne di più, consulta la nostra{' '}
        <Link href="/privacy-policy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
      <button
        onClick={handleAccept}
        className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition-colors"
      >
        Accept All
      </button>
    </div>
  );
};

export default CookieConsentBanner;