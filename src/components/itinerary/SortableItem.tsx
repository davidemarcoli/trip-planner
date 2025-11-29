import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TripItem } from "@/lib/types";
import { ItemCard } from "./ItemCard";

interface SortableItemProps {
    item: TripItem;
    tripId: string;
    dayId: string;
    onDelete: () => void;
    onUpdate: () => void;
    onItemClick?: (item: TripItem) => void;
    readOnly?: boolean;
}

export function SortableItem({ item, tripId, dayId, onDelete, onUpdate, onItemClick, readOnly }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: item.id,
        data: {
            type: 'item',
            item,
            dayId
        },
        disabled: readOnly
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <ItemCard
                item={item}
                tripId={tripId}
                dayId={dayId}
                onDelete={onDelete}
                onUpdate={onUpdate}
                onClick={() => onItemClick?.(item)}
                readOnly={readOnly}
            />
        </div>
    );
}
