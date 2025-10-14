'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/src/components/AuthContext';
import { MenuItem, MenuCategory } from '@/app/utils/definitions'; // Assuming MenuItem and MenuCategory are defined here

interface Localisation {
  [key: string]: {
    [key: string]: string;
  };
}

const localisation: Localisation = {
  'en': {
    'addMenuItem': 'Add New Service',
    'serviceName': 'Service Name',
    'serviceDescription': 'Service Description',
    'servicePrice': 'Price',
    'serviceDuration': 'Duration (minutes)',
    'serviceCategory': 'Category',
    'selectCategory': 'Select a category',
    'submit': 'Add Service',
    'success': 'Service added successfully!',
    'error': 'Failed to add service.',
    'unauthorized': 'You are not authorized to view this page.',
    'loading': 'Loading...',
    'fetchingCategoriesError': 'Failed to fetch categories.',
  },
  'fr': {
    'addMenuItem': 'Ajouter une nouvelle prestation',
    'serviceName': 'Nom de la prestation',
    'serviceDescription': 'Description de la prestation',
    'servicePrice': 'Prix',
    'serviceDuration': 'Durée (minutes)',
    'serviceCategory': 'Catégorie',
    'selectCategory': 'Sélectionnez une catégorie',
    'submit': 'Ajouter la prestation',
    'success': 'Prestation ajoutée avec succès !',
    'error': 'Échec de l\'ajout de la prestation.',
    'unauthorized': 'Vous n\'êtes pas autorisé à voir cette page.',
    'loading': 'Chargement...',
    'fetchingCategoriesError': 'Échec du chargement des catégories.',
  }
};

export default function AdminMenuItemsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [message, setMessage] = useState('');
  const [lang, setLang] = useState('fr'); // Default to French

  useEffect(() => {
    if (!isLoading) {
      if (!user || !user.isAdmin) {
        router.push('/signin');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/menu/categories'); // Fetch from the new categories endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data: MenuCategory[] = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setMessage(localisation[lang].fetchingCategoriesError);
      }
    };
    fetchCategories();
  }, [lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/admin/menu-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, price, duration, categoryId }),
      });

      if (response.ok) {
        setMessage(localisation[lang].success);
        setName('');
        setDescription('');
        setPrice('');
        setDuration('');
        setCategoryId('');
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || localisation[lang].error);
      }
    } catch (error) {
      console.error('Error adding menu item:', error);
      setMessage(localisation[lang].error);
    }
  };

  if (isLoading) {
    return <p>{localisation[lang].loading}</p>;
  }

  if (!user || !user.isAdmin) {
    return <p>{localisation[lang].unauthorized}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-pink-500 mb-6">{localisation[lang].addMenuItem}</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        {message && <p className="mb-4 text-green-600">{message}</p>}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            {localisation[lang].serviceName}
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            {localisation[lang].serviceDescription}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            {localisation[lang].servicePrice}
          </label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            step="0.01"
            required
          />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            {localisation[lang].serviceDuration}
          </label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            {localisation[lang].serviceCategory}
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">{localisation[lang].selectCategory}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-pink-500 to-orange-400 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-all duration-300 ease-in-out"
        >
          {localisation[lang].submit}
        </button>
      </form>
    </div>
  );
}
