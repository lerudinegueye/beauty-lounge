'use client';

import React from 'react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[linear-gradient(135deg,#f8e1f4_0%,#fce4ec_100%)] bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full text-center">
                <h2 className="text-2xl font-bold mb-4">Connexion requise</h2>
                <p className="mb-6">Vous devez vous connecter pour réserver un service.</p>
                <a
                    href="/signin"
                    className="w-full bg-pink-500 text-white font-bold py-2 px-4 rounded-full hover:bg-pink-600 transition duration-300 mb-3 inline-block"
                >
                    Se connecter
                </a>
                <button
                    onClick={onClose}
                    className="w-full bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-400 transition duration-300"
                >
                    Fermer
                </button>
            </div>
        </div>
    );
};

export default LoginModal;
