"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LocationSearch } from "./LocationSearch";

const formSchema = z.object({
    type: z.enum(['hotel', 'flight', 'restaurant', 'activity', 'transport', 'custom']),
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    time: z.string().optional(),
    endTime: z.string().optional(),
    address: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    notes: z.string().optional(),
    cost: z.string().optional(),
    flightNumber: z.string().optional(),
    arrivalLocationName: z.string().optional(),
    arrivalLocationAddress: z.string().optional(),
    arrivalLocationLat: z.number().optional(),
    arrivalLocationLng: z.number().optional(),
});

export type ItemFormValues = z.infer<typeof formSchema>;

interface ItemFormProps {
    defaultValues?: Partial<ItemFormValues>;
    onSubmit: (values: ItemFormValues) => Promise<void>;
    submitLabel?: string;
}

export function ItemForm({ defaultValues, onSubmit, submitLabel = "Save" }: ItemFormProps) {
    const form = useForm<ItemFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: 'activity',
            name: "",
            time: "",
            endTime: "",
            notes: "",
            cost: "",
            flightNumber: "",
            arrivalLocationName: "",
            ...defaultValues,
        },
    });

    const type = form.watch("type");

    const handleLocationSelect = (location: { name: string; lat: number; lon: number }) => {
        form.setValue("address", location.name);
        form.setValue("latitude", location.lat);
        form.setValue("longitude", location.lon);
        if (!form.getValues("name")) {
            form.setValue("name", location.name.split(",")[0]);
        }
    };

    const handleArrivalLocationSelect = (location: { name: string; lat: number; lon: number }) => {
        form.setValue("arrivalLocationName", location.name);
        form.setValue("arrivalLocationAddress", location.name);
        form.setValue("arrivalLocationLat", location.lat);
        form.setValue("arrivalLocationLng", location.lon);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="activity">Activity</SelectItem>
                                    <SelectItem value="hotel">Hotel</SelectItem>
                                    <SelectItem value="flight">Flight</SelectItem>
                                    <SelectItem value="restaurant">Restaurant</SelectItem>
                                    <SelectItem value="transport">Transport</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Common Fields */}
                <FormItem>
                    <FormLabel>{type === 'flight' ? 'Departure Location' : 'Location'}</FormLabel>
                    <LocationSearch onSelect={handleLocationSelect} />
                    {form.getValues("address") && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Selected: {form.getValues("address")}
                        </p>
                    )}
                </FormItem>

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{type === 'flight' ? 'Airline / Flight' : 'Name'}</FormLabel>
                            <FormControl>
                                <Input placeholder={type === 'flight' ? "e.g. United Airlines" : "e.g. Eiffel Tower"} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Type Specific Fields */}
                {type === 'flight' && (
                    <>
                        <FormField
                            control={form.control}
                            name="flightNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Flight Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. UA123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormItem>
                            <FormLabel>Arrival Location</FormLabel>
                            <LocationSearch onSelect={handleArrivalLocationSelect} />
                            {form.getValues("arrivalLocationName") && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Selected: {form.getValues("arrivalLocationName")}
                                </p>
                            )}
                        </FormItem>
                    </>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {type === 'flight' ? 'Departure Time' : type === 'hotel' ? 'Check-in Time' : 'Start Time'}
                                </FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    {type === 'flight' ? 'Arrival Time' : type === 'hotel' ? 'Check-out Time' : 'End Time'}
                                </FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="cost"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cost</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Any details..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full">{submitLabel}</Button>
            </form>
        </Form>
    );
}
