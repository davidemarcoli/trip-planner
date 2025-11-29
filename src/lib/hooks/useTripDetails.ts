import { useState, useEffect, useCallback } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Trip, Day, TripItem } from "@/lib/types";
import { getTripDays, initializeTripDays, getTripItems } from "@/lib/services/itemService";

export const useTripDetails = (tripId: string) => {
    const [trip, setTrip] = useState<Trip | null>(null);
    const [days, setDays] = useState<Day[]>([]);
    const [items, setItems] = useState<TripItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchTripDetails = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch trip data
            const tripRef = doc(db, "trips", tripId);
            const tripSnap = await getDoc(tripRef);

            if (!tripSnap.exists()) {
                throw new Error("Trip not found");
            }

            const tripData = { id: tripSnap.id, ...tripSnap.data() } as Trip;
            setTrip(tripData);

            // Fetch days
            let tripDays = await getTripDays(tripId);

            // If no days exist, initialize them
            if (tripDays.length === 0) {
                await initializeTripDays(tripId, tripData.startDate.toDate(), tripData.endDate.toDate());
                tripDays = await getTripDays(tripId);
            }

            setDays(tripDays);

            // Fetch items
            const tripItems = await getTripItems(tripId);
            setItems(tripItems);

            setError(null);
        } catch (err) {
            console.error("Error fetching trip details", err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [tripId]);

    useEffect(() => {
        if (tripId) {
            fetchTripDetails();
        }
    }, [tripId, fetchTripDetails]);

    return { trip, days, items, loading, error, refreshDetails: fetchTripDetails };
};
