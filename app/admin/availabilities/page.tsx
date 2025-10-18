'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
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
  const frenchShortDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const [excludedDates, setExcludedDates] = useState<string[]>([]); // Exceptions (fermées) per date, format YYYY-MM-DD

  // Helpers for calendar preview (Monday as first day)
  const getMonthGrid = (y: number, m: number) => {
    const first = new Date(y, m - 1, 1);
    const daysInMonth = new Date(y, m, 0).getDate();
    // JS getDay(): 0=Sun..6=Sat. Convert to Monday-first index (0..6)
    const startOffset = (first.getDay() + 6) % 7;
    const cells: Array<number | null> = Array.from({ length: startOffset + daysInMonth }, (_, i) => {
      const dayNum = i - startOffset + 1;
      return i < startOffset ? null : dayNum;
    });
    return { cells, daysInMonth };
  };

  const isDayOpen = (y: number, m: number, d: number) => {
    const jsDay = new Date(y, m - 1, d).getDay(); // 0..6 (Sun..Sat)
    const mondayIdx = (jsDay + 6) % 7; // 0..6 Mon..Sun
    const englishName = daysOfWeek[mondayIdx];
    return availableDays.includes(englishName);
  };

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const dateKey = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
  const isExcepted = (y: number, m: number, d: number) => excludedDates.includes(dateKey(y, m, d));
  const toggleException = (d: number) => {
    const key = dateKey(year, month, d);
    setExcludedDates(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]));
  };

  // Persist exceptions per month in localStorage (temporary until backend exists)
  useEffect(() => {
    const storageKey = `adminAvail_exceptions_${year}_${pad(month)}`;
    try {
      const stored = localStorage.getItem(storageKey);
      setExcludedDates(stored ? JSON.parse(stored) : []);
    } catch {
      setExcludedDates([]);
    }
    return () => { /* no-op */ };
  }, [year, month]);

  useEffect(() => {
    const storageKey = `adminAvail_exceptions_${year}_${pad(month)}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(excludedDates));
    } catch {}
  }, [excludedDates, year, month]);

  const navigateMonth = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear = year - 1;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear = year + 1;
    }
    setMonth(newMonth);
    setYear(newYear);
  };

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

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

      {/* Month preview calendar */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => navigateMonth(-1)}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 hover:bg-gray-50"
            aria-label="Mois précédent"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-700" />
          </button>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-center">
            {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
          </h2>
          <button
            type="button"
            onClick={() => navigateMonth(1)}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 hover:bg-gray-50"
            aria-label="Mois suivant"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-700" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-3 text-center">
          Les jours en rose sont ouverts selon les jours sélectionnés ci-dessus.
        </p>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {frenchShortDays.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-600">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {(() => {
                const { cells } = getMonthGrid(year, month);
                return cells.map((val, idx) => {
                  if (val === null) return <div key={`empty-${idx}`} />;
                  const open = isDayOpen(year, month, val);
                  const except = isExcepted(year, month, val);
                  return (
                    <button
                      type="button"
                      onClick={() => toggleException(val)}
                      key={`day-${val}`}
                      className={`h-16 rounded-md border flex items-center justify-center text-sm transition-colors ${
                        except
                          ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                          : open
                          ? 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                      title={except ? 'Exception: fermé' : open ? 'Ouvert' : 'Fermé'}
                    >
                      <span className="font-medium">{val}</span>
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-pink-400" /> Ouvert (jours sélectionnés)</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-gray-400" /> Fermé</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-400" /> Exception (fermé ce jour)</span>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Astuce: clique sur un jour pour le marquer comme exception (non sauvegardé pour l’instant).
        </div>
        {excludedDates.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExcludedDates([])}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            >
              Réinitialiser les exceptions du mois
            </button>
            <span className="text-xs text-gray-500">(sera persisté localement finché la page reste nel browser)</span>
          </div>
        )}
      </div>

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
