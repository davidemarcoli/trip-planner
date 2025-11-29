"use client";

import { useTrips } from "@/lib/hooks/useTrips";
import { TripCard } from "./TripCard";
import { CreateTripDialog } from "./CreateTripDialog";
import { Skeleton } from "@/components/ui/skeleton";

export function TripList() {
    const { trips, loading, error, refreshTrips } = useTrips();

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-[125px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500">Error loading trips: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Trips</h2>
                <CreateTripDialog onTripCreated={refreshTrips} />
            </div>

            {trips.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                    <p className="text-gray-500 mb-4">No trips found. Start planning your next adventure!</p>
                    <CreateTripDialog onTripCreated={refreshTrips} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trips.map((trip) => (
                        <TripCard key={trip.id} trip={trip} onDelete={refreshTrips} />
                    ))}
                </div>
            )}
        </div>
    );
}
