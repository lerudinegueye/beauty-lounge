'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/src/components/AuthContext'; 
import { format } from 'date-fns'; 
import { Menu, Transition } from '@headlessui/react';
import { EllipsisVerticalIcon, ArrowPathIcon } from '@heroicons/react/20/solid';
import EditBookingModal from '@/app/src/components/EditBookingModal';
import DeleteConfirmationModal from '@/app/src/components/DeleteConfirmationModal';
import { Booking, BookingStatus } from '@/app/utils/definitions';
import { fr } from 'date-fns/locale';

export default function AdminBookingsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortField, setSortField] = useState<'start_time' | 'created_at'>('start_time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (!isAuthLoading && (!user || !user.isAdmin)) {
      router.push('/signin');
      return;
    }

    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          sortField,
          sortOrder,
          status: statusFilter,
          page: String(page),
          pageSize: String(pageSize),
        });
        const response = await fetch(`/api/admin/bookings?${params.toString()}`);
        if (!response.ok) throw new Error('Échec de la récupération des réservations');
        const result = await response.json();
        setBookings(result.data || []);
        setTotal(result.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Échec du chargement des réservations');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.isAdmin) {
      fetchBookings();
    }
  }, [user, isAuthLoading, router, sortField, sortOrder, statusFilter, page, pageSize]);

  const handleUpdateBooking = async (bookingId: number, data: Partial<Booking>) => {
    try {
      // If admin confirms status, also flag payment_confirmation confirmed for consistency
      const payload: any = {
        ...data,
      };
      if (data.status === 'confirmed' && !('payment_confirmation' in data)) {
        payload.payment_confirmation = 'confirmed';
      }
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Échec de la mise à jour de la réservation');
      }

      const updatedBooking = await response.json();

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, ...updatedBooking } : booking
        )
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Échec de la mise à jour');
    }
  };

  const handleOpenModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (bookingId: number) => {
    setBookingToDelete(bookingId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (bookingToDelete === null) return;

    try {
      const response = await fetch(`/api/admin/bookings/${bookingToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Échec de la suppression de la réservation');
      }

      setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== bookingToDelete));
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Échec de la suppression');
    } finally {
      setIsDeleteModalOpen(false);
      setBookingToDelete(null);
    }
  };

  const handleDelete = async (bookingId: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.')) {
      try {
        const response = await fetch(`/api/admin/bookings/${bookingId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Échec de la suppression de la réservation');
        }

        // Mettre à jour l'état pour retirer la réservation supprimée de la liste
        setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== bookingId));

      } catch (error) {
        setError(error instanceof Error ? error.message : 'Échec de la suppression');
      }
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  if (!isLoading && total === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Gestion des Réservations</h1>
        <div className="text-center text-gray-500">Aucune réservation trouvée</div>
      </div>
    );
  }

  const getStatusBadgeClass = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* En-tête et contrôles de filtre */}
      <div className="flex flex-col items-center gap-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 text-center">Gestion des Réservations</h1>
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 items-end gap-5 md:gap-6 p-5 md:p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="w-full">
              <label htmlFor="sort" className="block font-semibold text-gray-800 mb-1.5">Trier par</label>
              <select
                id="sort"
                value={sortField}
                onChange={(e) => { setSortField(e.target.value as 'start_time' | 'created_at'); setPage(1); }}
                className="block w-full min-w-[12rem] rounded-md border-gray-300 shadow-sm h-11 px-3 text-sm md:text-base focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="start_time">Date du rendez-vous</option>
                <option value="created_at">Date de réservation</option>
              </select>
            </div>
            <div className="w-full">
              <label htmlFor="order" className="block font-semibold text-gray-800 mb-1.5">Ordre</label>
              <select
                id="order"
                value={sortOrder}
                onChange={(e) => { setSortOrder(e.target.value as 'asc' | 'desc'); setPage(1); }}
                className="block w-full min-w-[12rem] rounded-md border-gray-300 shadow-sm h-11 px-3 text-sm md:text-base focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="asc">Croissant</option>
                <option value="desc">Décroissant</option>
              </select>
            </div>
            <div className="w-full">
              <label htmlFor="status" className="block font-semibold text-gray-800 mb-1.5">Filtrer par statut</label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as BookingStatus | 'all'); setPage(1); }}
                className="block w-full min-w-[12rem] rounded-md border-gray-300 shadow-sm h-11 px-3 text-sm md:text-base focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
            <div className="w-full">
              <label htmlFor="pageSize" className="block font-semibold text-gray-800 mb-1.5">Par page</label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(1); }}
                className="block w-full min-w-[12rem] rounded-md border-gray-300 shadow-sm h-11 px-3 text-sm md:text-base focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            {/* Reset filters button */}
            <div className="w-full flex sm:col-span-2 lg:col-span-1">
              <button
                type="button"
                onClick={() => { setSortField('start_time'); setSortOrder('asc'); setStatusFilter('all'); setPageSize(10); setPage(1); }}
                className="w-full h-11 rounded-md border border-gray-300 bg-white px-3 text-sm md:text-base font-medium text-gray-700 hover:bg-gray-100 shadow-sm flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
                <span>Réinitialiser les filtres</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <EditBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        booking={selectedBooking}
        onUpdate={handleUpdateBooking}
        onDelete={handleDeleteRequest}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible."
      />

      <div className="shadow border-b border-gray-200 sm:rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Heure
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut & Paiement
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings              
              .map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(new Date(booking.start_time), 'PPP', { locale: fr })}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(booking.start_time), 'HH:mm')} - 
                    {format(new Date(booking.end_time), 'HH:mm')}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">ID de réservation : {booking.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {`${booking.customer_first_name} ${booking.customer_last_name}`}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.customer_email}</div>
                  <div className="text-sm text-gray-500">{booking.customer_phone || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 flex flex-col items-start gap-1">
                    {(() => {
                      const name = booking.menu_items.name;
                      const match = name.match(/(.*)\s\((séance|sèance|forfait)\)/i);
                      const baseName = match ? match[1].trim() : name;
                      const typeLabel = match ? match[2] : null;
                      return (
                        <>
                          <span>{baseName}</span>
                          {typeLabel && (
                            <span className="px-2 py-0.5 text-xs font-bold text-white bg-pink-500 rounded-full shadow-sm">
                              {typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.menu_items.price}CFA
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {/* Inline status selector */}
                    <div>
                      <label htmlFor={`status-${booking.id}`} className="sr-only">Statut</label>
                      <select
                        id={`status-${booking.id}`}
                        value={booking.status}
                        onChange={(e) => handleUpdateBooking(booking.id, { status: e.target.value as BookingStatus })}
                        className="block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                      >
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmé</option>
                        <option value="cancelled">Annulé</option>
                      </select>
                    </div>

                    {booking.status !== 'pending' && (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    )}
                    <span className={`px-2 inline-flex text-xs leading-5 font-medium rounded-full ${
                      booking.payment_confirmation === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : booking.payment_confirmation === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.payment_confirmation === 'confirmed'
                        ? 'Acompte payé'
                        : booking.payment_confirmation === 'pending'
                        ? 'Acompte à vérifier' : ''
                      }
                    </span>
                    {booking.payment_method && (
                      <span className="text-xs text-gray-500">
                        via {booking.payment_method}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="relative flex justify-end items-center">
                    <Menu as="div" className="relative inline-block text-left">
                      <div>
                        <Menu.Button className="inline-flex justify-center w-full rounded-md p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                          <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                        </Menu.Button>
                      </div>
                      <Transition
                        as={React.Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="px-1 py-1 ">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleOpenModal(booking)}
                                  className={`${
                                    active ? 'bg-pink-500 text-white' : 'text-gray-900'
                                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                >
                                  Modifier
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleDeleteRequest(booking.id)}
                                  className={`${
                                    active ? 'bg-pink-500 text-white' : 'text-gray-900'
                                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                >
                                  Supprimer
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {page} sur {Math.max(1, Math.ceil(total / pageSize))} • {total} réservations
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 rounded border text-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Précédent
          </button>
          <button
            className="px-3 py-1 rounded border text-sm disabled:opacity-50"
            onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
            disabled={page >= totalPages}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  );}
