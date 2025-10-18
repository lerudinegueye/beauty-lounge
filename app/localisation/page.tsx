import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Localisation - Beauty Lounge',
  description: 'Découvrez où nous trouver et contactez-nous pour prendre rendez-vous.',
};

const LocalisationPage = () => {
  const googleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3858.60275980758!2d-17.504478424891218!3d14.7350367857674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTTCsDQ0JzA2LjEiTiAxN8KwMzAnMDYuOSJX!5e0!3m2!1sit!2sit!4v1760221606718!5m2!1sit!2sit";
  const lat = 14.7350368;
  const lng = -17.5044784;
  const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="text-gray-800 py-8 sm:py-10">
      <div className="container mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-pink-700 mb-8 sm:mb-10">
          Notre Localisation
        </h1>

        <div className="bg-white rounded-lg shadow-xl p-5 sm:p-8 mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-pink-600 mb-4 sm:mb-6 text-center">Où nous trouver</h2>
          <p className="text-base sm:text-lg text-gray-700 text-center mb-6 sm:mb-8">
            Venez nous rendre visite à notre salon. Nous sommes impatients de vous accueillir !
          </p>

          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-stretch">
            {/* Salon image */}
            <div className="lg:w-1/2 w-full">
              <div className="relative w-full h-56 sm:h-72 lg:h-96 rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/logo.jpg"
                  alt="Beauty Lounge"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain bg-white"
                  priority={false}
                />
              </div>
            </div>

            {/* Google Map */}
            <div className="lg:w-1/2 w-full">
              <div className="w-full h-56 sm:h-72 lg:h-96 rounded-lg overflow-hidden shadow-md">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={googleMapsEmbedUrl}
                  title="Google Map of Beauty Lounge"
                ></iframe>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href={mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold hover:from-pink-600 hover:to-orange-500 transition-all"
                >
                  Itinéraire
                </a>
                <a href="tel:+221789907905" className="inline-flex items-center justify-center px-4 py-2 rounded-full border-2 border-pink-500 text-pink-600 font-semibold hover:bg-pink-50 transition-all">
                  Appeler
                </a>
                <a href="mailto:info@beautylounge.com" className="inline-flex items-center justify-center px-4 py-2 rounded-full border-2 border-pink-500 text-pink-600 font-semibold hover:bg-pink-50 transition-all">
                  Écrire
                </a>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 sm:mt-10">
            <div className="max-w-2xl mx-auto text-left grid grid-cols-[max-content_1fr] gap-x-1 gap-y-2">
              <span className="text-base sm:text-lg text-gray-800 font-semibold">Adresse:</span>
              <span className="text-base sm:text-lg text-gray-700">Cité Cheikh Amar, Mamelles Dakar, Senegal</span>

              <span className="text-base sm:text-lg text-gray-800 font-semibold">Téléphone:</span>
              <a className="text-base sm:text-lg text-pink-600 hover:underline" href="tel:+221789907905">+221789907905</a>

              <span className="text-base sm:text-lg text-gray-800 font-semibold">Email:</span>
              <a className="text-base sm:text-lg text-pink-600 hover:underline break-all" href="mailto:info@beautylounge.com">info@beautylounge.com</a>
            </div>
          </div>
        </div>

        {/* Retour Button */}
        <div className="text-center mt-10 sm:mt-12">
          <Link
            href="/"
            className="bg-white text-pink-600 border-2 border-pink-600 font-bold py-3 px-8 rounded-full hover:bg-pink-600 hover:text-white transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105"
          >
            Retour à l'accueil
          </Link>
        </div>

        {/* SEO: LocalBusiness JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BeautySalon',
              name: 'Beauty Lounge',
              telephone: '+221789907905',
              email: 'info@beautylounge.com',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Cité Cheikh Amar, Mamelles',
                addressLocality: 'Dakar',
                addressCountry: 'SN',
              },
              geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng },
              url: 'https://beauty-lounge.example',
            }),
          }}
        />
      </div>
    </div>
  );
};

export default LocalisationPage;
