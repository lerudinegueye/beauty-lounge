"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthFormProps {
  type: 'sign-in' | 'sign-up';
}

export default function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    switch (name) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      default:
        break;
    }
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const url = type === 'sign-up' ? '/api/auth/signup' : '/api/auth/signin';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setSuccess(data.message);

      if (type === 'sign-up') {
        router.push('/');
      } else if (type === 'sign-in') {
        // Handle successful sign-in, e.g., redirect
      }

    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSignIn = async () => {
    try {
      // Perform sign-in logic here
      // For example, check if the user exists in the database
      // and authenticate their credentials
      setSuccess('Sign in successful');
    } catch (error) {
      setError('Error signing in');
    }
  };

  const handleSignUp = async () => {
    try {
      // Perform sign-up logic here
      // For example, check if the email is already in use
      // and insert a new user into the database
      setSuccess('Sign up successful');
    } catch (error) {
      setError('Error signing up');
    }
  };

  return (
    <div>
      <h1>{type === 'sign-in' ? 'Sign In' : 'Sign Up'}</h1>
      {error && <p>{error}</p>}
      {success && <p>{success}</p>}
      <form onSubmit={handleFormSubmit}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={handleInputChange}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-orange-400 to-yellow-300 text-white font-semibold shadow hover:from-orange-500 hover:to-yellow-400 transition"
        >
          {type === 'sign-in' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
      <p>
        {type === 'sign-in' ? "Don't have an account? " : 'Already have an account? '}
        <a
          href="#"
          onClick={() =>
            router.push(type === 'sign-in' ? '/auth/signup' : '/auth/signin')
          }
        >
          {type === 'sign-in' ? 'Sign Up' : 'Sign In'}
        </a>
      </p>
      <button onClick={type === 'sign-in' ? handleSignIn : handleSignUp}>
        {type === 'sign-in' ? 'Sign In' : 'Sign Up'}
      </button>
    </div>
  );
}