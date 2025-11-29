import { TripItem } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2Icon, MapPinIcon, ClockIcon, BedDoubleIcon, PlaneIcon, UtensilsIcon, TicketIcon, CarIcon, MapPin } from "lucide-react";
import { deleteItem } from "@/lib/services/itemService";
import { EditItemDialog } from "./EditItemDialog";

interface ItemCardProps {
    item: TripItem;
    tripId: string;
    dayId: string;
    onDelete: () => void;
    onUpdate: () => void;
    onClick?: () => void;
    readOnly?: boolean;
}

const getItemIcon = (type: string) => {
    switch (type) {
        case 'hotel': return <BedDoubleIcon className="h-5 w-5 text-blue-500" />;
        case 'flight': return <PlaneIcon className="h-5 w-5 text-purple-500" />;
        case 'restaurant': return <UtensilsIcon className="h-5 w-5 text-red-500" />;
        case 'activity': return <TicketIcon className="h-5 w-5 text-green-500" />;
        case 'transport': return <CarIcon className="h-5 w-5 text-orange-500" />;
        default: return <MapPin className="h-5 w-5 text-gray-500" />;
    }
};

export function ItemCard({ item, tripId, dayId, onDelete, onUpdate, onClick, readOnly }: ItemCardProps) {
    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (readOnly) return;
        if (confirm("Are you sure you want to delete this item?")) {
            await deleteItem(tripId, dayId, item.id);
            onDelete();
        }
    };

    return (
        <Card
            className={`overflow-hidden break-inside-avoid transition-colors hover:bg-accent/50 ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-1">
                    {getItemIcon(item.type)}
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <h4 className="font-semibold">{item.name}</h4>
                        <div className="flex items-center gap-2">
                            {(item.time || item.endTime) && (
                                <div className="flex items-center text-xs text-gray-500">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    {item.time}
                                    {item.endTime && ` - ${item.endTime}`}
                                </div>
                            )}
                            {!readOnly && (
                                <>
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <EditItemDialog item={item} tripId={tripId} dayId={dayId} onUpdate={onUpdate} />
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-500" onClick={handleDelete}>
                                        <Trash2Icon className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {item.type === 'flight' && (
                        <div className="text-sm text-gray-600 mt-1">
                            {item.flightNumber && <span className="mr-2 font-medium">{item.flightNumber}</span>}
                            {item.arrivalLocationName && (
                                <span className="flex items-center mt-1">
                                    <PlaneIcon className="h-3 w-3 mr-1 rotate-90" />
                                    To: {item.arrivalLocationName}
                                </span>
                            )}
                        </div>
                    )}

                    {item.address && (
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            {item.address}
                        </div>
                    )}
                    {item.notes && (
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded dark:bg-gray-800 dark:text-gray-300">
                            {item.notes}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
