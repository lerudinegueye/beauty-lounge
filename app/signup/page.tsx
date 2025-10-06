import AuthForm from '../src/components/AuthForm';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Link href="/" className="text-pink-500 hover:text-orange-400 font-semibold mb-4 inline-block">
          &larr; Retour à l'accueil
        </Link>
        <AuthForm type="signup" />
      </div>
    </div>
  );
}