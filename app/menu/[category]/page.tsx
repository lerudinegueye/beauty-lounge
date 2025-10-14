import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link'; // Import Link for navigation
import ServiceCards from './ServiceCards'; // Import the generic ServiceCards component

interface ServiceCategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateMetadata({ params }: ServiceCategoryPageProps): Promise<Metadata> {
  const categoryName = decodeURIComponent(params.category);
  return {
    title: `${categoryName} - Beauty Lounge`,
    description: `Découvrez nos traitements de ${categoryName} et réservez votre séance.`,
  };
}

const ServiceCategoryPage: React.FC<ServiceCategoryPageProps> = ({ params }) => {
  const categoryName = decodeURIComponent(params.category);

  return (
    <div className="min-h-screen bg-pink-50 text-gray-800 py-12">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <Link href="/menu" className="inline-flex items-center text-pink-600 hover:text-pink-800 transition-colors duration-300">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Retour aux prestations
          </Link>
        </div>
        <h1 className="text-4xl font-extrabold text-center text-pink-700 mb-10">
          Nos Services de {categoryName}
        </h1>
        <ServiceCards categoryName={categoryName} />
      </div>
    </div>
  );
};

export default ServiceCategoryPage;
