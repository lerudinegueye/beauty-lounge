"use client";

import AuthForm from '../src/components/AuthForm';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function SignInContent() {
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Link href="/" className="text-pink-500 hover:text-orange-400 font-semibold mb-4 inline-block">
          &larr; Retour à l'accueil
        </Link>
        {verified === 'true' && (
          <p className="text-green-500 bg-green-100 p-4 rounded-md text-center mb-4">
            Votre e-mail a été vérifié avec succès ! Vous pouvez maintenant vous connecter.
          </p>
        )}
        <AuthForm type="signin" />
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
