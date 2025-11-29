import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";
import { db } from "./config";
import { User } from "firebase/auth";

export const createUserProfile = async (user: User) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const { email, displayName, photoURL } = user;
        const createdAt = serverTimestamp();

        try {
            await setDoc(userRef, {
                uid: user.uid,
                email,
                displayName,
                photoURL,
                createdAt,
            });
        } catch (error) {
            console.error("Error creating user profile", error);
        }
    }

    return userRef;
};
