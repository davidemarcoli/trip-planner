import { Timestamp } from "firebase/firestore";

export interface Trip {
    id: string;
    title: string;
    description?: string;
    startDate: Timestamp;
    endDate: Timestamp;
    ownerId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    isPublic: boolean;
    publicShareToken?: string;
}

export interface CreateTripData {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
}

export interface Day {
    id: string;
    date: Timestamp;
    order: number;
    tripId: string;
}

export type ItemType = 'hotel' | 'flight' | 'restaurant' | 'activity' | 'transport' | 'custom';

export interface TripItem {
    id: string;
    dayId: string;
    tripId: string;
    type: ItemType;
    order: number;
    time?: string;
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
    cost?: number;
    currency?: string;
    details: Record<string, any>;
    createdAt: Timestamp;
    // New fields for Phase 9
    endTime?: string;
    flightNumber?: string;
    arrivalLocationName?: string;
    arrivalLocationAddress?: string;
    arrivalLocationLat?: number;
    arrivalLocationLng?: number;
}

export interface CreateItemData {
    type: ItemType;
    time?: string;
    name: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    notes?: string;
    cost?: number;
    currency?: string;
    details: Record<string, any>;
    // New fields
    endTime?: string;
    flightNumber?: string;
    arrivalLocationName?: string;
    arrivalLocationAddress?: string;
    arrivalLocationLat?: number;
    arrivalLocationLng?: number;
}
