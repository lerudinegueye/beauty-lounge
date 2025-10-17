// app/src/components/Timetable.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface TimetableProps {
    selectedDate: Date;
    // If provided, the component will fetch times itself using the API
    selectedServiceId?: number | null;
    // If provided, the component will use these times directly and not fetch
    availableTimes?: string[];
    allTimes?: string[];
    onTimeSelect: (time: string) => void;
    selectedTime?: string | null;
    // Optional external state (used when availableTimes are provided by parent)
    isLoading?: boolean;
    error?: string | null;
    onDateChange?: (date: Date) => void;
}

const Timetable: React.FC<TimetableProps> = ({ selectedDate, selectedServiceId, availableTimes: externalAvailableTimes, allTimes: externalAllTimes, onTimeSelect, selectedTime, isLoading, error }) => {
    const [availableTimes, setAvailableTimes] = useState<string[]>(externalAvailableTimes || []);
    const [allTimes, setAllTimes] = useState<string[]>(externalAllTimes || []);
    const [loading, setLoading] = useState(false);
    const [internalError, setInternalError] = useState<string | null>(null);

    // Keep in sync if parent passes availableTimes
    useEffect(() => {
        if (externalAvailableTimes) {
            setAvailableTimes(externalAvailableTimes);
        }
        if (externalAllTimes) {
            setAllTimes(externalAllTimes);
        }
    }, [externalAvailableTimes, externalAllTimes]);

    // Internal fetch mode: only if no externalAvailableTimes and selectedServiceId provided
    useEffect(() => {
        if (!externalAvailableTimes) {
            if (selectedDate && selectedServiceId) {
                setLoading(true);
                setInternalError(null);
                const dateString = format(selectedDate, 'yyyy-MM-dd');
                fetch(`/api/availabilities?date=${dateString}&serviceId=${selectedServiceId}`)
                    .then(res => {
                        if (!res.ok) {
                            throw new Error('Failed to fetch availabilities');
                        }
                        return res.json();
                    })
                    .then(data => {
                        // Support both new ({allTimes, availableTimes}) and legacy (array) responses
                        if (Array.isArray(data)) {
                            setAllTimes(data);
                            setAvailableTimes(data);
                        } else {
                            setAllTimes(data.allTimes || []);
                            setAvailableTimes(data.availableTimes || []);
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        setInternalError('Impossibile caricare gli orari. Riprova più tardi.');
                        setAllTimes([]);
                        setAvailableTimes([]);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            } else {
                setAllTimes([]);
                setAvailableTimes([]);
            }
        }
    }, [selectedDate, selectedServiceId, externalAvailableTimes]);

    if (isLoading || loading) {
        return <div className="text-center p-4">Caricamento orari...</div>;
    }

    if (error || internalError) {
        return <div className="text-center p-4 text-red-500">{error || internalError}</div>;
    }

    if (allTimes.length === 0 && availableTimes.length === 0 && !(isLoading || loading)) {
        return <div className="text-center p-4">Nessun orario disponibile per questa data o servizio.</div>;
    }

    const timesToRender = Array.isArray(allTimes) && allTimes.length > 0
        ? allTimes
        : (Array.isArray(availableTimes) ? availableTimes : []);

    return (
        <div className="grid grid-cols-4 gap-2 p-4 bg-white rounded-lg shadow">
            {timesToRender.map(time => {
                const isAvailable = availableTimes.includes(time);
                const isSelected = time === selectedTime;

                return (
                    <button
                        key={time}
                        onClick={() => isAvailable && onTimeSelect(time)}
                        disabled={!isAvailable}
                        className={`p-2 rounded text-center text-sm font-medium transition-colors
                            ${isAvailable
                                ? (isSelected
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-gray-100 hover:bg-pink-100')
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed line-through'
                            }
                        `}
                    >
                        {time}
                    </button>
                );
            })}
        </div>
    );
};

export default Timetable;