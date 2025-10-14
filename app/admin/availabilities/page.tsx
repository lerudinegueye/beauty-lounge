'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For redirection or navigation
import { useAuth } from '../../src/components/AuthContext'; // Assuming AuthContext provides user info
import Modal from '../../src/components/Modal'; // Import the Modal component

const AdminAvailabilitiesPage: React.FC = () => {
  const { user, isLoading } = useAuth(); // Get user and loading state from AuthContext
  const router = useRouter();

  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableHours, setAvailableHours] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availabilityExists, setAvailabilityExists] = useState<boolean>(false); // New state to track if availability exists
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false); // State for delete confirmation modal

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push('/signin');
    }
    // Fetch existing availability when month or year changes
    const fetchAvailability = async () => {
      if (month && year) {
        try {
          const response = await fetch(`/api/admin/availabilities/${month}/${year}`);
          if (response.ok) {
            const data = await response.json();
            if (data.availability) {
              setAvailableDays(data.availability.availableDays.split(','));
              setAvailableHours(data.availability.availableHours);
              setAvailabilityExists(true);
            } else {
              setAvailableDays([]);
              setAvailableHours('');
              setAvailabilityExists(false);
            }
          } else if (response.status === 404) {
            setAvailableDays([]);
            setAvailableHours('');
            setAvailabilityExists(false);
          } else {
            // Only attempt to parse JSON if the response is not 404 and not OK, but still has content
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              setError(data.message || 'Failed to fetch availabilities.');
            } else {
              setError('Failed to fetch availabilities: Server returned non-JSON response.');
            }
          }
        } catch (err) {
          console.error('Error fetching availabilities:', err);
          setError('An unexpected error occurred while fetching availabilities.');
        }
      }
    };
    fetchAvailability();
  }, [user, isLoading, router, month, year]);

  const handleDayToggle = (day: string) => {
    setAvailableDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (availableDays.length === 0 || !availableHours.trim()) {
      setError('Veuillez sélectionner au moins un jour et fournir les heures disponibles.');
      return;
    }

    const method = availabilityExists ? 'PUT' : 'POST';
    const url = availabilityExists ? `/api/admin/availabilities/${month}/${year}` : '/api/admin/availabilities';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month,
          year,
          availableDays: availableDays.join(','),
          availableHours: availableHours,
        }),
      });

      if (response.ok) {
        setMessage(`Disponibilités ${availabilityExists ? 'mises à jour' : 'enregistrées'} avec succès !`);
        setAvailabilityExists(true); // Ensure this is true after a successful save/update
      } else {
        const data = await response.json();
        setError(data.message || `Échec de ${availabilityExists ? 'la mise à jour' : 'l\'enregistrement'} des disponibilités.`);
      }
    } catch (err) {
      console.error('Error submitting availabilities:', err);
      setError('An unexpected error occurred.');
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteModalOpen(false); // Close the modal immediately
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/availabilities/${month}/${year}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMessage('Disponibilités supprimées avec succès !');
        setAvailableDays([]);
        setAvailableHours('');
        setAvailabilityExists(false);
      } else {
        const data = await response.json();
        setError(data.message || 'Échec de la suppression des disponibilités.');
      }
    } catch (err) {
      console.error('Error deleting availabilities:', err);
      setError('An unexpected error occurred.');
    }
  };

  if (isLoading || !user || !user.isAdmin) {
    return <div className="text-center py-10">Chargement ou non autorisé...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-pink-500 mb-6">Gérer les disponibilités de l'administrateur</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">Mois :</label>
          <input
            type="number"
            id="month"
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            min="1"
            max="12"
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Année :</label>
          <input
            type="number"
            id="year"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            min="2023" // Adjust as needed
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Jours disponibles :</label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => handleDayToggle(day)}
                className={`px-4 py-2 rounded-md ${
                  availableDays.includes(day) ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {day === 'Monday' ? 'Lundi' :
                 day === 'Tuesday' ? 'Mardi' :
                 day === 'Wednesday' ? 'Mercredi' :
                 day === 'Thursday' ? 'Jeudi' :
                 day === 'Friday' ? 'Vendredi' :
                 day === 'Saturday' ? 'Samedi' :
                 'Dimanche'}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="availableHours" className="block text-sm font-medium text-gray-700 mb-1">Heures disponibles (séparées par des virgules, ex: 09:00,10:00,11:00) :</label>
          <input
            type="text"
            id="availableHours"
            value={availableHours}
            onChange={(e) => setAvailableHours(e.target.value)}
            placeholder="ex: 09:00,10:00,11:00"
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-pink-500 to-orange-400 rounded-lg hover:from-pink-600 hover:to-orange-500 transition-all duration-300 ease-in-out"
        >
          Enregistrer ou modifier les disponibilités
        </button>

        {availabilityExists && (
          <button
            type="button"
            onClick={handleDeleteClick}
            className="w-full mt-4 px-4 py-3 font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all duration-300 ease-in-out"
          >
            Supprimer les disponibilités
          </button>
        )}

        {message && <p className="mt-4 text-green-600">{message}</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </form>

      {isDeleteModalOpen && (
        <Modal 
          isOpen={isDeleteModalOpen} 
          onClose={() => setIsDeleteModalOpen(false)} 
          onConfirm={handleDeleteConfirm}
          title="Confirmer la suppression"
          confirmText="Supprimer"
        >
          <p className="text-gray-700">Êtes-vous sûr de vouloir supprimer les disponibilités pour {month}/{year}?</p>
        </Modal>
      )}
    </div>
  );
};

export default AdminAvailabilitiesPage;
