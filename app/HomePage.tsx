"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Modal from "./src/components/Modal";
import { useCart } from "./src/components/CartContext"; // 1. Importo useCart

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

  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  useEffect(() => {
    if (success) {
      setModalContent({ title: "Paiement Réussi", message: "Votre paiement a été effectué avec succès !" });
      clearCart();
    }
    if (canceled) {
      setModalContent({ title: "Paiement Annulé", message: "Le paiement a été annulé." });
    }
  }, [success, canceled, clearCart, setModalContent]);

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

  const closeModal = () => {
    setModalContent(null);
    // Rimuove i parametri dall'URL senza ricaricare la pagina
    window.history.replaceState({}, document.title, "/");
  };

  return (
    <>
      <div className="flex gap-6 flex-wrap justify-center p-8">
        {cards.map(card => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300 p-6 w-full max-w-xs"
          >
            <h2 className="text-xl font-bold mb-2 text-gray-800 text-center">{card.title}</h2>
            <p className="mb-4 text-gray-600 text-center flex-grow\">{card.description}</p>
            <Link
              href={card.href}
              className="mt-auto bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-all duration-300 ease-in-out w-full text-center"
            >
              Découvrir
            </Link>
          </div>
        ))}
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