import {
    collection,
    doc,
    getDocs,
    query,
    where,
    setDoc,
    deleteDoc,
    updateDoc,
    serverTimestamp,
    getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User } from "firebase/auth";

export interface TripPermission {
    userId: string;
    email: string;
    displayName: string;
    photoURL: string;
    role: 'view' | 'edit';
    createdAt: any;
}

export const inviteUser = async (tripId: string, email: string, role: 'view' | 'edit') => {
    try {
        // 1. Find user by email
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("User not found. They must sign up first.");
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        // 2. Add permission
        const permissionRef = doc(db, `trips/${tripId}/permissions`, userDoc.id);
        await setDoc(permissionRef, {
            userId: userDoc.id,
            email: userData.email,
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            role,
            createdAt: serverTimestamp()
        });

        return userDoc.id;
    } catch (error) {
        console.error("Error inviting user", error);
        throw error;
    }
};

export const removeUser = async (tripId: string, userId: string) => {
    try {
        await deleteDoc(doc(db, `trips/${tripId}/permissions`, userId));
    } catch (error) {
        console.error("Error removing user", error);
        throw error;
    }
};

export const updateRole = async (tripId: string, userId: string, role: 'view' | 'edit') => {
    try {
        await updateDoc(doc(db, `trips/${tripId}/permissions`, userId), { role });
    } catch (error) {
        console.error("Error updating role", error);
        throw error;
    }
};

export const getTripPermissions = async (tripId: string): Promise<TripPermission[]> => {
    try {
        const snapshot = await getDocs(collection(db, `trips/${tripId}/permissions`));
        return snapshot.docs.map(doc => doc.data() as TripPermission);
    } catch (error) {
        console.error("Error fetching permissions", error);
        throw error;
    }
};

export const togglePublic = async (tripId: string, isPublic: boolean) => {
    try {
        await updateDoc(doc(db, "trips", tripId), { isPublic });
    } catch (error) {
        console.error("Error toggling public status", error);
        throw error;
    }
};

export const getUserRole = async (tripId: string, userId: string): Promise<'owner' | 'edit' | 'view' | null> => {
    try {
        // Check if owner
        const tripDoc = await getDoc(doc(db, "trips", tripId));
        if (tripDoc.exists() && tripDoc.data().ownerId === userId) {
            return 'owner';
        }

        // Check permissions
        const permDoc = await getDoc(doc(db, `trips/${tripId}/permissions`, userId));
        if (permDoc.exists()) {
            return permDoc.data().role as 'edit' | 'view';
        }

        return null;
    } catch (error) {
        console.error("Error fetching user role", error);
        return null;
    }
};
