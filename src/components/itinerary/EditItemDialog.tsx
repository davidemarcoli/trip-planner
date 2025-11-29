"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { updateItem } from "@/lib/services/itemService";
import { ItemType, TripItem } from "@/lib/types";
import { PencilIcon } from "lucide-react";
import { ItemForm, ItemFormValues } from "./ItemForm";

interface EditItemDialogProps {
    item: TripItem;
    tripId: string;
    dayId: string;
    onUpdate: () => void;
}

export function EditItemDialog({ item, tripId, dayId, onUpdate }: EditItemDialogProps) {
    const [open, setOpen] = useState(false);

    async function onSubmit(values: ItemFormValues) {
        try {
            await updateItem(tripId, dayId, item.id, {
                type: values.type as ItemType,
                name: values.name,
                time: values.time,
                endTime: values.endTime,
                address: values.address,
                latitude: values.latitude,
                longitude: values.longitude,
                notes: values.notes,
                cost: values.cost ? parseFloat(values.cost) : undefined,
                flightNumber: values.flightNumber,
                arrivalLocationName: values.arrivalLocationName,
                arrivalLocationAddress: values.arrivalLocationAddress,
                arrivalLocationLat: values.arrivalLocationLat,
                arrivalLocationLng: values.arrivalLocationLng,
            });
            setOpen(false);
            onUpdate();
        } catch (error) {
            console.error("Failed to update item", error);
        }
    }

    const defaultValues: Partial<ItemFormValues> = {
        type: item.type,
        name: item.name,
        time: item.time || "",
        endTime: item.endTime || "",
        address: item.address || "",
        latitude: item.latitude,
        longitude: item.longitude,
        notes: item.notes || "",
        cost: item.cost?.toString() || "",
        flightNumber: item.flightNumber || "",
        arrivalLocationName: item.arrivalLocationName || "",
        arrivalLocationAddress: item.arrivalLocationAddress || "",
        arrivalLocationLat: item.arrivalLocationLat,
        arrivalLocationLng: item.arrivalLocationLng,
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-blue-500">
                    <PencilIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Item</DialogTitle>
                    <DialogDescription>
                        Update details for this item.
                    </DialogDescription>
                </DialogHeader>
                <ItemForm defaultValues={defaultValues} onSubmit={onSubmit} submitLabel="Save Changes" />
            </DialogContent>
        </Dialog>
    );
}
