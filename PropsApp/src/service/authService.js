import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";
import { FIRESTORE_DB } from "../config/firebaseConfig";

export const setUsername = async (uid) => {
    try {
        const docRef = doc(FIRESTORE_DB, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) throw new Error("User document not found.");

        AsyncStorage.setItem("Username", docSnap.data().username);
    } catch (err) {
        throw new Error("Failed to retrieve user document.");
    }
};