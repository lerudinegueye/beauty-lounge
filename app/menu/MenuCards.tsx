'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../src/components/AuthContext';

interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string;
}

interface Category {
  name: string;
  menuItems: Service[];
}

// Timetable Component
interface TimetableProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  availableTimes: string[];
  onTimeSelect: (time: string) => void;
  isLoading: boolean;
  error: string | null;
}

const Timetable: React.FC<TimetableProps> = ({ 
  selectedDate, 
  onDateChange, 
  availableTimes, 
  onTimeSelect, 
  isLoading, 
  error 
}) => {
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(new Date(event.target.value));
  };

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 mb-1">
          Scegli una data:
        </label>
        <input
          type="date"
          id="date-picker"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={handleDateChange}
          min={new Date().toISOString().split('T')[0]}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Orari disponibili:</h3>
        {isLoading && <p>Caricamento...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && (
          <div className="grid grid-cols-4 gap-2">
            {availableTimes.length > 0 ? (
              availableTimes.map(time => (
                <button
                  key={time}
                  onClick={() => onTimeSelect(time)}
                  className="bg-pink-500 text-white px-3 py-2 rounded-md hover:bg-pink-600 transition"
                >
                  {time}
                </button>
              ))
            ) : (
              <p>Nessun orario disponibile per questa data.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Login Modal Component
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Accesso Richiesto</h2>
        <p className="mb-6">Devi effettuare l'accesso per poter prenotare un servizio.</p>
        <a
          href="/signin"
          className="w-full bg-pink-500 text-white font-bold py-2 px-4 rounded-full hover:bg-pink-600 transition duration-300 mb-3 inline-block"
        >
          Accedi
        </a>
        <button
          onClick={onClose}
          className="w-full bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full hover:bg-gray-400 transition duration-300"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
};

const MenuCards: React.FC<{ menu: Category[] }> = ({ menu }) => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showTimetable, setShowTimetable] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const { user } = useAuth();

  const fetchAvailableTimes = async (serviceId: number, date: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await fetch(`/api/availabilities?serviceId=${serviceId}&date=${formattedDate}&serviceType=menu`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok');
      }
      const data = await response.json();
      setAvailableTimes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookClick = (service: Service) => {
    if (!user) {
      setIsLoginModalOpen(true);
    } else {
      setSelectedService(service);
      setShowTimetable(true);
      fetchAvailableTimes(service.id, selectedDate);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    if (selectedService) {
      fetchAvailableTimes(selectedService.id, date);
    }
  };

  const handleTimeSelect = async (time: string) => {
    if (selectedService && user) {
      // Combine date and time into ISO datetime string
      const [hours, minutes] = time.split(':');
      const bookingDateTime = new Date(selectedDate);
      bookingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // Split user name into first and last name
      const nameParts = user.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const bookingData = {
        serviceId: selectedService.id,
        serviceType: 'menu',
        startTime: bookingDateTime.toISOString(),
        firstName: firstName,
        lastName: lastName,
        email: user.email,
        phoneNumber: user.phone || '',
      };

      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Booking failed');
        }

        setBookingSuccess(true);
        setShowTimetable(false);
        setTimeout(() => setBookingSuccess(false), 5000);

      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Tabs per le categorie */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {menu.map((category, index) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(index)}
              className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                selectedCategory === index
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Card dei servizi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menu[selectedCategory]?.menuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">{item.name}</h2>
              <p className="text-gray-600 mb-4">{item.description || 'Nessuna descrizione disponibile'}</p>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-pink-500">{item.price}€</span>
              <button
                onClick={() => handleBookClick(item)}
                className="bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition duration-300"
              >
                Prendre rendez-vous
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuCards;