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
    Timestamp,
    orderBy
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Trip, CreateTripData } from "@/lib/types";

const COLLECTION_NAME = "trips";

export const createTrip = async (userId: string, data: CreateTripData) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            ownerId: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isPublic: false,
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating trip", error);
        throw error;
    }
};

export const getUserTrips = async (userId: string): Promise<Trip[]> => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("ownerId", "==", userId),
            orderBy("startDate", "asc")
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Trip));
    } catch (error) {
        console.error("Error fetching trips", error);
        throw error;
    }
};

export const deleteTrip = async (tripId: string) => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, tripId));
    } catch (error) {
        console.error("Error deleting trip", error);
        throw error;
    }
};

export const updateTrip = async (tripId: string, data: Partial<Trip>) => {
    try {
        const tripRef = doc(db, COLLECTION_NAME, tripId);
        await updateDoc(tripRef, {
            ...data,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error updating trip", error);
        throw error;
    }
};
