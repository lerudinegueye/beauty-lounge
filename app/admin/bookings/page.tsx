'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/components/AuthContext';
import { Booking } from '../../utils/definitions'; // Assuming Booking type is defined here
import Modal from '../../src/components/Modal'; // Reusing a generic Modal component
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminBookingsPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push('/signin');
    }
    if (user?.isAdmin) {
      fetchBookings();
    }
  }, [user, isLoading, router]);

  const fetchBookings = async () => {
    setMessage(null);
    setError(null);
    try {
      const response = await fetch('/api/admin/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
      } else {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setError(data.message || 'Échec du chargement des rendez-vous.');
        } else {
          setError('Échec du chargement des rendez-vous: Le serveur a renvoyé une réponse non-JSON.');
        }
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Une erreur inattendue est survenue lors du chargement des rendez-vous.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      return;
    }
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Rendez-vous supprimé avec succès !');
        fetchBookings(); // Refresh the list
      } else {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setError(data.message || 'Échec de la suppression du rendez-vous.');
        } else {
          setError('Échec de la suppression du rendez-vous: Le serveur a renvoyé une réponse non-JSON.');
        }
      }
    } catch (err) {
      console.error('Error deleting booking:', err);
      setError('Une erreur inattendue est survenue lors de la suppression du rendez-vous.');
    }
  };

  const handleEdit = (booking: Booking) => {
    setCurrentBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleUpdateBooking = async (updatedBooking: Booking) => {
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/bookings/${updatedBooking.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedBooking),
      });

      if (response.ok) {
        setMessage('Rendez-vous mis à jour avec succès !');
        setIsEditModalOpen(false);
        fetchBookings(); // Refresh the list
      } else {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setError(data.message || 'Échec de la mise à jour du rendez-vous.');
        } else {
          setError('Échec de la mise à jour du rendez-vous: Le serveur a renvoyé une réponse non-JSON.');
        }
      }
    } catch (err) {
      console.error('Error updating booking:', err);
      setError('Une erreur inattendue est survenue lors de la mise à jour du rendez-vous.');
    }
  };

  if (isLoading || !user || !user.isAdmin) {
    return <div className="text-center py-10">Chargement ou non autorisé...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-pink-500 mb-6">Gérer les rendez-vous</h1>

      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prestation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Début</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.menu_items?.name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{`${booking.customer_first_name} ${booking.customer_last_name}`}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.customer_email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.customer_phone || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(booking.start_time), 'PPPp', { locale: fr })}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{format(new Date(booking.end_time), 'PPPp', { locale: fr })}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(booking)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(booking.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && currentBooking && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modifier le rendez-vous">
          <BookingEditForm booking={currentBooking} onSave={handleUpdateBooking} onCancel={() => setIsEditModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
};

interface BookingEditFormProps {
  booking: Booking;
  onSave: (updatedBooking: Booking) => void;
  onCancel: () => void;
}

const BookingEditForm: React.FC<BookingEditFormProps> = ({ booking, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Booking>(booking);
  const [menuItems, setMenuItems] = useState<any[]>([]); // State for menu items to select from

  useEffect(() => {
    console.log('BookingEditForm - Initial booking data:', booking);
    console.log('BookingEditForm - Initial formData:', formData);
    // Fetch menu items to populate the dropdown
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('/api/menu/categories'); // Assuming this endpoint returns all menu items or categories with items
        if (response.ok) {
          const data = await response.json();
          // Flatten categories into a single list of menu items
          const allMenuItems = data.categories.flatMap((category: any) => category.menuItems);
          setMenuItems(allMenuItems);
        } else {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.error(data.message || 'Failed to fetch menu items for edit form.');
          } else {
            console.error('Failed to fetch menu items for edit form: Server returned non-JSON response.');
          }
        }
      } catch (error) {
        console.error('Error fetching menu items:', error);
      }
    };
    fetchMenuItems();
  }, [booking]); // Added booking to dependency array to re-run if booking changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'menu_item_id' || name === 'user_id' ? parseInt(value) : value,
    }));
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: new Date(value).toISOString(), // Ensure ISO string format for backend
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="menu_item_id" className="block text-sm font-medium text-gray-700">Prestation</label>
        <select
          id="menu_item_id"
          name="menu_item_id"
          value={formData.menu_item_id}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          required
        >
          {menuItems.map(item => (
            <option key={item.id} value={item.id}>{item.name} - {item.price}€ ({item.duration}min)</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="customer_first_name" className="block text-sm font-medium text-gray-700">Prénom Client</label>
        <input
          type="text"
          id="customer_first_name"
          name="customer_first_name"
          value={formData.customer_first_name}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label htmlFor="customer_last_name" className="block text-sm font-medium text-gray-700">Nom Client</label>
        <input
          type="text"
          id="customer_last_name"
          name="customer_last_name"
          value={formData.customer_last_name}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700">Email Client</label>
        <input
          type="email"
          id="customer_email"
          name="customer_email"
          value={formData.customer_email}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700">Téléphone Client</label>
        <input
          type="text"
          id="customer_phone"
          name="customer_phone"
          value={formData.customer_phone || ''}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">Heure de début</label>
        <input
          type="datetime-local"
          id="start_time"
          name="start_time"
          value={formData.start_time ? format(new Date(formData.start_time), "yyyy-MM-dd'T'HH:mm") : ''}
          onChange={handleDateTimeChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div>
        <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">Heure de fin</label>
        <input
          type="datetime-local"
          id="end_time"
          name="end_time"
          value={formData.end_time ? format(new Date(formData.end_time), "yyyy-MM-dd'T'HH:mm") : ''}
          onChange={handleDateTimeChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
        >
          Sauvegarder
        </button>
      </div>
    </form>
  );
};

export default AdminBookingsPage;
