import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    getDocs,
    serverTimestamp,
    orderBy,
    writeBatch,
    Timestamp,
    collectionGroup
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Day, TripItem, CreateItemData, Trip } from "@/lib/types";
import { eachDayOfInterval, startOfDay } from "date-fns";

export const getTripDays = async (tripId: string): Promise<Day[]> => {
    try {
        const q = query(
            collection(db, `trips/${tripId}/days`),
            orderBy("order", "asc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Day));
    } catch (error) {
        console.error("Error fetching days", error);
        throw error;
    }
};

export const initializeTripDays = async (tripId: string, startDate: Date, endDate: Date) => {
    try {
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const batch = writeBatch(db);

        days.forEach((date, index) => {
            const dayRef = doc(collection(db, `trips/${tripId}/days`));
            batch.set(dayRef, {
                date: Timestamp.fromDate(startOfDay(date)),
                order: index,
                tripId
            });
        });

        await batch.commit();
    } catch (error) {
        console.error("Error initializing days", error);
        throw error;
    }
};

export const getDayItems = async (tripId: string, dayId: string): Promise<TripItem[]> => {
    try {
        const q = query(
            collection(db, `trips/${tripId}/days/${dayId}/items`),
            orderBy("order", "asc")
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TripItem));
    } catch (error) {
        console.error("Error fetching items", error);
        throw error;
    }
};

export const createItem = async (tripId: string, dayId: string, data: CreateItemData) => {
    try {
        // Get current items count to determine order
        const items = await getDayItems(tripId, dayId);
        const order = items.length;

        // Remove undefined fields from data
        const sanitizedData = Object.fromEntries(
            Object.entries(data).filter(([_, v]) => v !== undefined)
        );

        const docRef = await addDoc(collection(db, `trips/${tripId}/days/${dayId}/items`), {
            ...sanitizedData,
            tripId,
            dayId,
            order,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating item", error);
        throw error;
    }
};

export const deleteItem = async (tripId: string, dayId: string, itemId: string) => {
    try {
        await deleteDoc(doc(db, `trips/${tripId}/days/${dayId}/items`, itemId));
    } catch (error) {
        console.error("Error deleting item", error);
        throw error;
    }
};

export const updateItem = async (tripId: string, dayId: string, itemId: string, data: Partial<TripItem>) => {
    try {
        await updateDoc(doc(db, `trips/${tripId}/days/${dayId}/items`, itemId), data);
    } catch (error) {
        console.error("Error updating item", error);
        throw error;
    }
};

export const reorderItems = async (tripId: string, dayId: string, items: TripItem[]) => {
    try {
        const batch = writeBatch(db);

        items.forEach((item, index) => {
            const itemRef = doc(db, `trips/${tripId}/days/${dayId}/items`, item.id);
            batch.update(itemRef, { order: index });
        });

        await batch.commit();
    } catch (error) {
        console.error("Error reordering items", error);
        throw error;
    }
};

export const moveItemToDay = async (tripId: string, sourceDayId: string, destDayId: string, itemId: string, newOrder: number) => {
    try {
        const batch = writeBatch(db);

        // 1. Get the item
        const itemRef = doc(db, `trips/${tripId}/days/${sourceDayId}/items`, itemId);
        const itemSnap = await import("firebase/firestore").then(m => m.getDoc(itemRef));

        if (!itemSnap.exists()) throw new Error("Item not found");
        const itemData = itemSnap.data();

        // 2. Create new item in destination day
        const newItemRef = doc(collection(db, `trips/${tripId}/days/${destDayId}/items`));
        batch.set(newItemRef, {
            ...itemData,
            dayId: destDayId,
            order: newOrder,
            updatedAt: serverTimestamp()
        });

        // 3. Delete from source day
        batch.delete(itemRef);

        await batch.commit();
    } catch (error) {
        console.error("Error moving item", error);
        throw error;
    }
};

export const getTripItems = async (tripId: string): Promise<TripItem[]> => {
    try {
        const q = query(
            collectionGroup(db, 'items'),
            where('tripId', '==', tripId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TripItem));
    } catch (error) {
        console.error("Error fetching trip items", error);
        throw error;
    }
};
