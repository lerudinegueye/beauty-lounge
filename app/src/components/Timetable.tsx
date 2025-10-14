'use client';

import React from 'react';

interface TimetableProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    availableTimes: string[];
    onTimeSelect: (time: string) => void;
    isLoading: boolean;
    error: string | null;
}

const Timetable: React.FC<TimetableProps> = ({ selectedDate, onDateChange, availableTimes, onTimeSelect, isLoading, error }) => {
    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // The input value is a string like "2025-10-14". Create a new Date object.
        // new Date() will parse it as local time, which is the intended behavior.
        onDateChange(new Date(event.target.value));
    };

    // Format the date for the input value.
    const formatDateForInput = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div>
            <div className="mb-4">
                <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 mb-1">Choisissez une date :</label>
                <input
                    type="date"
                    id="date-picker"
                    value={formatDateForInput(selectedDate)}
                    onChange={handleDateChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
            </div>
            <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Horaires disponibles :</h3>
                {isLoading && <p>Chargement...</p>}
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
                            <p>Aucun horaire disponible pour cette date.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Timetable;
