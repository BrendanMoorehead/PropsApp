import { FIRESTORE_DB } from "../config/firebaseConfig";
import {doc, collection, setDoc, addDoc} from 'firebase/firestore'
//Service for users picks

export const setPick = async (pick, prop, uid) => {
    const userRef = collection(FIRESTORE_DB, 'users', uid, "activePicks");
    try {
        await addDoc(userRef, {
            prop: prop,
            pick: pick,
            active: true,
        });
    } catch (error){
        throw new Error("Pick failed to be made: " + error.message);
    }
}