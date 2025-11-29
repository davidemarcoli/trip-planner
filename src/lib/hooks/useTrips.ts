import { useState, useEffect, useCallback } from "react";
import { Trip } from "@/lib/types";
import { getUserTrips } from "@/lib/services/tripService";
import { useAuth } from "@/lib/hooks/useAuth";

export const useTrips = () => {
    const { user } = useAuth();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchTrips = useCallback(async () => {
        if (!user) {
            setTrips([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await getUserTrips(user.uid);
            setTrips(data);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchTrips();
    }, [fetchTrips]);

    return { trips, loading, error, refreshTrips: fetchTrips };
};
