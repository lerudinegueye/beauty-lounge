"use client";

import { useState } from "react";
import { useAuth } from "./AuthContext";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface AuthFormProps {
  type: 'signin' | 'signup';
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const variant = type.toUpperCase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`/api/auth/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          email, 
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue');
      }

      if (variant === 'SIGNUP') {
        setMessage('Inscription réussie ! Veuillez vérifier votre e-mail pour activer votre compte.');
      } else { // This is for signin
        login(); // Call login without token, AuthContext will fetch user
        window.location.href = callbackUrl || '/';
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const switchLink = type === 'signin' ? (
    <p className="text-sm text-center text-gray-600">
      Vous n'avez pas de compte ?{' '}
      <Link href={callbackUrl ? `/signup?callbackUrl=${callbackUrl}` : "/signup"} className="font-medium text-pink-500 hover:text-orange-400">
        Inscrivez-vous
      </Link>
    </p>
  ) : (
    <p className="text-sm text-center text-gray-600">
      Vous avez déjà un compte ?{' '}
      <Link href={callbackUrl ? `/signin?callbackUrl=${callbackUrl}` : "/signin"} className="font-medium text-pink-500 hover:text-orange-400">
        Connectez-vous
      </Link>
    </p>
  );

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-3xl font-bold text-center text-gray-900">
        {type === 'signin' ? 'Connexion' : 'Inscription'}
      </h2>
      {message && <p className="text-green-500 text-center bg-green-50 p-3 rounded-lg">{message}</p>}
      {error && <p className="text-red-500 text-center bg-red-50 p-3 rounded-lg">{error}</p>}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {type === 'signup' && (
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Nom d'utilisateur
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        )}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-pink-500 to-orange-400 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-all duration-300 ease-in-out"
        >
          {type === 'signin' ? 'Se connecter' : 'Créer un compte'}
        </button>
      </form>
      <div className="pt-4 text-center">
        {switchLink}
      </div>
    </div>
  );
};

export default AuthForm;
