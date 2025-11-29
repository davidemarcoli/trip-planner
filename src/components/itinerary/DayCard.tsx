import { Day, TripItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { getDayItems } from "@/lib/services/itemService";
import { ItemCard } from "./ItemCard";
import { AddItemDialog } from "./AddItemDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { SortableItem } from "./SortableItem";
import { cn } from "@/lib/utils";

interface DayCardProps {
    day: Day;
    tripId: string;
    items: TripItem[];
    onRefresh: () => void;
    readOnly?: boolean;
    onItemClick?: (item: TripItem) => void;
}

export function DayCard({ day, tripId, items, onRefresh, readOnly, onItemClick }: DayCardProps) {
    const { setNodeRef } = useDroppable({
        id: day.id,
        data: { dayId: day.id, type: 'day' },
        disabled: readOnly
    });

    const totalCost = items.reduce((sum, item) => sum + (item.cost || 0), 0);

    return (
        <Card className="mb-6 break-inside-avoid">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex flex-col">
                    <CardTitle className="text-lg font-medium">
                        Day {day.order + 1} - {format(day.date.toDate(), "EEEE, MMM d")}
                    </CardTitle>
                    {totalCost > 0 && (
                        <span className="text-sm text-gray-500 font-normal">
                            Total: ${totalCost.toFixed(2)}
                        </span>
                    )}
                </div>
                {!readOnly && <AddItemDialog tripId={tripId} dayId={day.id} onAdd={onRefresh} />}
            </CardHeader>
            <CardContent ref={setNodeRef} className={cn("min-h-[100px]", items.length === 0 && "flex items-center justify-center")}>
                {items.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 text-sm border-2 border-dashed rounded-lg w-full">
                        No items planned for this day
                    </div>
                ) : (
                    <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4 w-full">
                            {items.map((item) => (
                                <SortableItem
                                    key={item.id}
                                    item={item}
                                    tripId={tripId}
                                    dayId={day.id}
                                    onDelete={onRefresh}
                                    onUpdate={onRefresh}
                                    readOnly={readOnly}
                                    onItemClick={onItemClick}
                                />
                            ))}
                        </div>
                    </SortableContext>
                )}
            </CardContent>
        </Card>
    );
}
