"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Modal from "./src/components/Modal";
import { useCart } from "./src/components/CartContext";

const cards = [
  {
    title: "Cryolipolisi",
    description: "Traitements, prix et zones disponibles.",
    href: "/cryolipolisi"
  },
  {
    title: "Menu",
    description: "Services, catégories et prix.",
    href: "/menu"
  }
];

export default function HomePage() {
  const [modalContent, setModalContent] = useState<{ title: string; message: string } | null>(null);
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success) {
      setModalContent({ title: "Paiement Réussi", message: "Votre paiement a été effectué avec succès !" });
      clearCart();
    }
    if (canceled) {
      setModalContent({ title: "Paiement Annulé", message: "Le paiement a été annulé." });
    }
  }, [searchParams, clearCart]);

  const closeModal = () => {
    setModalContent(null);
    window.history.replaceState({}, document.title, "/");
  };

  return (
    <>
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-center p-8 bg-white">
        <div className="w-full md:w-1/2 p-4">
          <img
            src="/placeholder.jpg" // Sostituire con un'immagine appropriata
            alt="Esthétique haute technologie"
            className="rounded-lg shadow-lg w-full h-auto"
          />
        </div>
        <div className="w-full md:w-1/2 p-4 text-center md:text-left">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Esthétique haute technologie.
          </h1>
          <p className="text-xl text-gray-600">
            Résultats visibles, sans douleur ni intervention chirurgicale.
          </p>
        </div>
      </div>

      {/* Prenez soin de vous Section */}
      <div className="text-center p-12 bg-gray-50">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Prenez soin de vous</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Notre institut vous propose une sélection de soins esthétiques innovants pour le corps et le visage.
          Profitez de prestations sur-mesure, efficaces et non invasives, pensées pour révéler votre beauté naturelle.
        </p>
      </div>

      {/* Nos services Section */}
      <div className="p-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Nos services</h2>
        <div className="flex gap-6 flex-wrap justify-center">
          {cards.map(card => (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300 p-6 w-full max-w-xs"
            >
              <h2 className="text-xl font-bold mb-2 text-gray-800 text-center">{card.title}</h2>
              <p className="mb-4 text-gray-600 text-center flex-grow">{card.description}</p>
              <Link
                href={card.href}
                className="mt-auto bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-all duration-300 ease-in-out w-full text-center"
              >
                Découvrir
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Notre centre Section */}
      <div className="p-12 bg-gray-50">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Notre centre</h2>
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold uppercase text-gray-800 mb-3">Dakar, Senegal</h3>
          <p className="text-gray-600">
            Cité Cheikh Amar, Mamelles
          </p>
          <p className="text-gray-600 font-bold mt-2">
            Téléphone: 78 990 79 05
          </p>
          <a 
            href="https://www.google.com/maps/search/?api=1&query=Cité+Cheikh+Amar,+Mamelles,+Dakar,+Senegal" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mt-4 inline-block text-pink-500 hover:text-pink-600 transition-colors duration-300"
          >
            Voir sur Google Maps
          </a>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="p-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">NEWSLETTER</h2>
        <p className="text-lg text-center text-gray-600 mb-8">Inscrivez-vous à notre newsletter pour recevoir nos offres exclusives, nouveautés et conseils bien-être en avant-première !</p>
        <form className="max-w-md mx-auto">
          <div className="flex items-center">
            <input type="email" placeholder="Email" className="w-full p-3 rounded-l-lg border-t mr-0 border-b border-l text-gray-800 border-gray-200 bg-white" />
            <button type="submit" className="px-6 py-3 rounded-r-lg bg-pink-500 text-white font-bold hover:bg-pink-600 transition-colors duration-300">
              Inscrivez-vous
            </button>
          </div>
        </form>
      </div>

      {modalContent && (
        <Modal
          isOpen={!!modalContent}
          onClose={closeModal}
          title={modalContent.title}
        >
          <p>{modalContent.message}</p>
        </Modal>
      )}
    </>
  );
}
