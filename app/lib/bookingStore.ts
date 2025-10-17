import { create } from 'zustand';
import { Service } from '@/app/utils/definitions';
export interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  paymentMethod: 'on_site' | 'wave';
}
interface BookingState {
  selectedService: Service | null;
  selectedDate: Date;
  selectedTime: string;
  allTimes: string[];
  availableTimes: string[];
  isLoading: boolean;
  error: string | null;
  bookingSuccess: boolean;
  isTimetableOpen: boolean;
  isWaveInstructionsOpen: boolean;
  waveBookingDetails: { service: Service | null; bookingId: number | null };
  isBookingFormOpen: boolean;
  isLoginModalOpen: boolean;

  // Actions
  openTimetable: (service: Service) => void;
  closeTimetable: () => void;
  openBookingForm: (time: string) => void;
  closeBookingForm: () => void;
  closeWaveInstructions: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  setSelectedDate: (date: Date) => void;
  fetchAvailableTimes: (serviceId: number, date: Date) => Promise<void>;
  submitBooking: (formData: BookingFormData, user: { id: number } | null) => Promise<void>;
  resetBookingFlow: () => void;
}

const useBookingStore = create<BookingState>((set, get) => ({
  // Initial State
  selectedService: null,
  // Initialize date in UTC to avoid timezone shifts
  selectedDate: new Date(new Date().toISOString().split('T')[0] + 'T00:00:00Z'),
  selectedTime: '',
  allTimes: [],
  availableTimes: [],
  isLoading: false,
  error: null,
  bookingSuccess: false,
  isTimetableOpen: false,
  isWaveInstructionsOpen: false,
  waveBookingDetails: { service: null, bookingId: null },
  isBookingFormOpen: false,
  isLoginModalOpen: false,

  // Actions
  openTimetable: (service) => {
    set({
      selectedService: service,
      isTimetableOpen: true,
      error: null,
      allTimes: [],
      availableTimes: [],
      selectedDate: new Date(new Date().toISOString().split('T')[0] + 'T00:00:00Z'), // Reset to today's date in UTC
    });
    get().fetchAvailableTimes(service.id, get().selectedDate);
  },
  closeTimetable: () => set({ isTimetableOpen: false, selectedService: null }),

  openBookingForm: (time) => set({ selectedTime: time, isTimetableOpen: false, isBookingFormOpen: true }),
  closeBookingForm: () => set({ isBookingFormOpen: false, selectedTime: '' }),

  closeWaveInstructions: () => set({ isWaveInstructionsOpen: false, waveBookingDetails: { service: null, bookingId: null } }),

  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    const serviceId = get().selectedService?.id;
    if (serviceId) {
      get().fetchAvailableTimes(serviceId, date);
    }
  },

  fetchAvailableTimes: async (serviceId, date) => {
    set({ isLoading: true, error: null });
    try {
      // Format the date for the API call, ensuring it respects UTC.
      // This prevents the date from shifting back by one day due to timezone conversion.
      const year = date.getUTCFullYear();
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = date.getUTCDate().toString().padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      const response = await fetch(`/api/availabilities?serviceId=${serviceId}&date=${formattedDate}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch available times');
      }
      const data = await response.json();
      // Support both array response and object { allTimes, availableTimes }
      const availableTimes = Array.isArray(data)
        ? data
        : Array.isArray(data?.availableTimes)
          ? data.availableTimes
          : [];
      const allTimes = Array.isArray(data)
        ? data
        : Array.isArray(data?.allTimes)
          ? data.allTimes
          : availableTimes;
      set({ availableTimes, allTimes, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, availableTimes: [], isLoading: false });
    }
  },

  submitBooking: async (formData, user) => {
    const { selectedService, selectedDate, selectedTime } = get();
    if (!selectedService || !selectedDate || !selectedTime) {
      set({ error: "Please ensure all booking details are selected." });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const [hours, minutes] = selectedTime.split(':');
      const bookingDateTime = new Date(selectedDate);
      bookingDateTime.setUTCHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const bookingData = {
        menu_item_id: selectedService.id,
        start_time: bookingDateTime.toISOString(),
        end_time: new Date(bookingDateTime.getTime() + selectedService.duration * 60000).toISOString(),
        userId: user?.id, // Pass the user ID
        ...formData,
      };

  const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Booking failed');
      }

  const result = await response.json();

      // For Wave, show payment instructions instead of success message
      set({
        isBookingFormOpen: false,
        isWaveInstructionsOpen: true,
        waveBookingDetails: { service: selectedService, bookingId: result.bookingId },
      });
    } catch (err: any) {
      // If the time just became unavailable, mark it as read-only by removing it from availableTimes
      const msg = String(err.message || '');
      if (/non è più disponibile|not available|unavailable/i.test(msg)) {
        set((state) => ({
          availableTimes: state.availableTimes.filter((t) => t !== state.selectedTime),
          isLoading: false,
        }));
      } else {
        set({ error: err.message, isLoading: false });
      }
    }
  },

  resetBookingFlow: () => set({ selectedService: null, selectedTime: '', isBookingFormOpen: false, isLoading: false }),
}));

export default useBookingStore;