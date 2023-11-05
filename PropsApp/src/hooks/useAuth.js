import { useEffect, useState } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from "../config/firebaseConfig";
import { doc, getDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from "../config/firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';
const auth = FIREBASE_AUTH;

export function useAuth(){
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubFromAuthStateChanged = onAuthStateChanged(auth, (user) => {
            if (user){
                setUser(user);
            } else {
                setUser(null);
            }
        })
        return unsubFromAuthStateChanged
    }, []);
    return {user, loading};
}