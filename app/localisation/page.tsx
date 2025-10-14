import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Localisation - Beauty Lounge',
  description: 'Découvrez où nous trouver et contactez-nous pour prendre rendez-vous.',
};

const LocalisationPage = () => {
  const googleMapsEmbedUrl = "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3858.60275980758!2d-17.504478424891218!3d14.7350367857674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTTCsDQ0JzA2LjEiTiAxN8KwMzAnMDYuOSJX!5e0!3m2!1sit!2sit!4v1760221606718!5m2!1sit!2sit";
  const coordinates = "14°44'06.1\"N 17°30'06.9\"W"; // Display coordinates as text

  return (
    <div className="min-h-screen bg-pink-50 text-gray-800 py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-extrabold text-center text-pink-700 mb-10">
          Notre Localisation
        </h1>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-pink-600 mb-6 text-center">Où nous trouver</h2>
          <p className="text-lg text-gray-700 text-center mb-8">
            Venez nous rendre visite à notre salon. Nous sommes impatients de vous accueillir !
          </p>

          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Placeholder Image */}
            <div className="lg:w-1/2 w-full">
              <img
                src="/logo.jpg" // Replaced with logo.jpg
                alt="Beauty Lounge Logo"
                className="rounded-lg shadow-md w-full h-96 object-contain"
              />
            </div>

            {/* Google Map */}
            <div className="lg:w-1/2 w-full h-96">
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
          </div>

          <div className="text-center mt-10">
            <p className="text-xl font-semibold text-gray-800 mb-2">Adresse:</p>
            <p className="text-lg text-gray-700">Cité Cheikh Amar, Mamelles Dakar, Senegal</p>
            <p className="text-xl font-semibold text-gray-800 mt-6 mb-2">Contact:</p>
            <p className="text-lg text-gray-700">Téléphone: +221789907905</p>
            <p className="text-lg text-gray-700">Email: info@beautylounge.com</p>
          </div>
        </div>

        {/* Retour Button */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="bg-pink-600 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LocalisationPage;
