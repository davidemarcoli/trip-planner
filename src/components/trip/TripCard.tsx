import { Trip } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { deleteTrip } from "@/lib/services/tripService";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TripCardProps {
    trip: Trip;
    onDelete: () => void;
}

export function TripCard({ trip, onDelete }: TripCardProps) {
    const handleDelete = async () => {
        try {
            await deleteTrip(trip.id);
            onDelete();
        } catch (error) {
            console.error("Failed to delete trip", error);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{trip.title}</CardTitle>
                <CardDescription>
                    {trip.description || "No description"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(trip.startDate.toDate(), "MMM d, yyyy")} - {format(trip.endDate.toDate(), "MMM d, yyyy")}
                </div>
                {/* Placeholder for destination count */}
                <div className="flex items-center text-sm text-gray-500">
                    <MapPinIcon className="mr-2 h-4 w-4" />
                    0 Destinations
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button asChild variant="outline">
                    <Link href={`/trips/${trip.id}`}>View Details</Link>
                </Button>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your trip
                                and all associated data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
}
