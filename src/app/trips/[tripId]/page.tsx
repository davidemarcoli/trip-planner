"use client";

import { useTripDetails } from "@/lib/hooks/useTripDetails";
import { DayCard } from "@/components/itinerary/DayCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftIcon, CalendarIcon, MapPinIcon, PrinterIcon } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from "next/dynamic";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    TouchSensor
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { reorderItems, moveItemToDay } from "@/lib/services/itemService";
import { getUserRole } from "@/lib/services/permissionService";
import { ItemCard } from "@/components/itinerary/ItemCard";
import { TripItem } from "@/lib/types";
import { useState, useEffect } from "react";
import { ShareTripDialog } from "@/components/trip/ShareTripDialog";
import { useAuth } from "@/lib/hooks/useAuth";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useReactToPrint } from "react-to-print";

const TripMap = dynamic(() => import("@/components/map/TripMap"), {
    ssr: false,
    loading: () => <Skeleton className="h-[400px] w-full rounded-lg" />
});

export default function TripDetailsPage({ params }: { params: Promise<{ tripId: string }> }) {
    const { tripId } = React.use(params);
    const { user } = useAuth();
    const { trip, days, items, loading, error, refreshDetails } = useTripDetails(tripId);
    const [activeItem, setActiveItem] = useState<TripItem | null>(null);
    const [userRole, setUserRole] = useState<'owner' | 'editor' | 'viewer' | null>(null);
    const [focusedItem, setFocusedItem] = useState<TripItem | null>(null);

    const handleItemClick = (item: TripItem) => {
        if (item.latitude && item.longitude) {
            setFocusedItem(item);
            // Switch to map tab on mobile if not already there
            if (window.innerWidth < 1024) {
                // Optional: Logic to switch tab
            }
        }
    };

    const componentRef = React.useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: trip?.title || "Trip Itinerary",
    });

    useEffect(() => {
        const fetchRole = async () => {
            if (user && trip) {
                const role = await getUserRole(trip.id, user.uid);
                // Map 'edit' to 'editor' and 'view' to 'viewer' to match state type
                if (role === 'edit') setUserRole('editor');
                else if (role === 'view') setUserRole('viewer');
                else setUserRole(role as 'owner' | 'editor' | 'viewer' | null);
            }
        };
        fetchRole();
    }, [user, trip]);

    const canEdit = userRole === 'owner' || userRole === 'editor';

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
            disabled: !canEdit
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
            disabled: !canEdit
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
            disabled: !canEdit
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.item) {
            setActiveItem(event.active.data.current.item as TripItem);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        if (!canEdit) return;
        const { active, over } = event;
        setActiveItem(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeData = active.data.current;
        const overData = over.data.current;

        if (!activeData || !overData) return;

        const sourceDayId = activeData.dayId;
        // Determine destDayId: if over is a day, use its ID. If over is an item, use its dayId.
        const destDayId = overData.type === 'day' ? overId : overData.dayId;

        if (!sourceDayId || !destDayId) return;

        if (sourceDayId === destDayId) {
            // Reordering within same day
            const dayItems = items.filter(i => i.dayId === sourceDayId).sort((a, b) => a.order - b.order);
            const oldIndex = dayItems.findIndex(i => i.id === activeId);
            const newIndex = dayItems.findIndex(i => i.id === overId);

            if (oldIndex !== newIndex) {
                if (!trip) return;
                const newOrder = arrayMove(dayItems, oldIndex, newIndex);
                await reorderItems(trip.id, sourceDayId, newOrder);
                refreshDetails();
            }
        } else {
            // Moving to a different day
            if (!trip) return;
            await moveItemToDay(trip.id, sourceDayId, destDayId, activeId, 9999); // Append to end
            refreshDetails();
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-[300px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                    <Skeleton className="h-10 w-[100px]" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                    <div className="lg:col-span-1 space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-[200px] w-full rounded-lg" />
                            </div>
                        ))}
                    </div>
                    <div className="hidden lg:block lg:col-span-2 h-full">
                        <Skeleton className="h-full w-full rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !trip) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-red-600">Error Loading Trip</h2>
                <p className="text-gray-500 mt-2">{error?.message || "Trip not found"}</p>
                <Button asChild className="mt-4">
                    <Link href="/trips">Back to Trips</Link>
                </Button>
            </div>
        );
    }

    // Calculate total cost (this would ideally be done on the backend or with a more efficient query)
    // For now, we'll just show a placeholder or need to fetch all items to calculate.
    // Since we only fetch days here, we can't easily calculate the total without fetching all items.
    // Let's skip the total trip cost for now to avoid N+1 queries or complex logic,
    // or we could add a 'cost' field to the Day document that gets updated via cloud functions.
    // For this MVP, we'll just show it on the day level.

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={canEdit ? [] : [restrictToWindowEdges]} // Or just disable sensors?
        >
            <div className="space-y-6" ref={componentRef}>
                <div className="flex items-center gap-4 mb-6 print:mb-4">
                    <Button variant="ghost" size="icon" asChild className="print:hidden">
                        <Link href="/trips">
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{trip.title}</h1>
                        <div className="flex items-center text-gray-500 mt-1 gap-4 text-sm">
                            <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {format(trip.startDate.toDate(), "MMM d, yyyy")} - {format(trip.endDate.toDate(), "MMM d, yyyy")}
                            </div>
                            {trip.description && (
                                <div className="flex items-center">
                                    <span className="mr-1">•</span>
                                    {trip.description}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="ml-auto flex gap-2 items-center print:hidden">
                        <Button variant="outline" size="sm" onClick={() => handlePrint()}>
                            <PrinterIcon className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                        {!canEdit && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border">
                                View Only
                            </span>
                        )}
                        {canEdit && <ShareTripDialog trip={trip} onUpdate={refreshDetails} />}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] print:block print:h-auto">
                    {/* Left Column: Itinerary (Scrollable) */}
                    <div className="lg:col-span-1 lg:overflow-y-auto pr-2 print:overflow-visible print:w-full">
                        <div className="lg:hidden mb-4 print:hidden">
                            {/* Mobile Tabs - Hide on print */}
                            <Tabs defaultValue="itinerary" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                    <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
                                    <TabsTrigger value="map">Map View</TabsTrigger>
                                </TabsList>

                                <TabsContent value="itinerary" className="space-y-6">
                                    {days.map((day) => (
                                        <DayCard
                                            key={day.id}
                                            day={day}
                                            tripId={trip.id}
                                            items={items.filter(i => i.dayId === day.id).sort((a, b) => a.order - b.order)}
                                            onRefresh={refreshDetails}
                                            readOnly={!canEdit}
                                            onItemClick={handleItemClick}
                                        />
                                    ))}
                                </TabsContent>

                                <TabsContent value="map">
                                    <div className="h-[600px] w-full border rounded-lg overflow-hidden">
                                        <TripMap items={items} focusedItem={focusedItem} />
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        <div className="hidden lg:block space-y-6 print:block">
                            {days.map((day) => (
                                <DayCard
                                    key={day.id}
                                    day={day}
                                    tripId={trip.id}
                                    items={items.filter(i => i.dayId === day.id).sort((a, b) => a.order - b.order)}
                                    onRefresh={refreshDetails}
                                    readOnly={!canEdit} // Always read-only in print, but we handle hiding buttons via CSS too
                                    onItemClick={handleItemClick}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Map (Fixed on Desktop) - Hide on print for now as maps are tricky */}
                    <div className="hidden lg:block lg:col-span-2 h-full border rounded-lg overflow-hidden sticky top-0 print:hidden">
                        <TripMap items={items} focusedItem={focusedItem} />
                    </div>
                </div>
            </div>
            <DragOverlay>
                {activeItem ? (
                    <div className="opacity-80 rotate-2">
                        <ItemCard item={activeItem} tripId={trip.id} dayId={activeItem.dayId} onDelete={() => { }} onUpdate={() => { }} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
