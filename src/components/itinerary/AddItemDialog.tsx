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
import { createItem } from "@/lib/services/itemService";
import { ItemType } from "@/lib/types";
import { PlusIcon } from "lucide-react";
import { ItemForm, ItemFormValues } from "./ItemForm";

interface AddItemDialogProps {
    tripId: string;
    dayId: string;
    onAdd: () => void;
}

export function AddItemDialog({ tripId, dayId, onAdd }: AddItemDialogProps) {
    const [open, setOpen] = useState(false);

    async function onSubmit(values: ItemFormValues) {
        try {
            await createItem(tripId, dayId, {
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
                details: {},
            });
            setOpen(false);
            onAdd();
        } catch (error) {
            console.error("Failed to add item", error);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <PlusIcon className="h-4 w-4 mr-1" /> Add Item
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add New Item</DialogTitle>
                    <DialogDescription>
                        Add an activity, hotel, or flight to this day.
                    </DialogDescription>
                </DialogHeader>
                <ItemForm onSubmit={onSubmit} submitLabel="Add Item" />
            </DialogContent>
        </Dialog>
    );
}
