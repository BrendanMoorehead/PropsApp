import { useEffect, useState } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from "../config/firebaseConfig";
const auth = FIREBASE_AUTH;

export function useAuth(){
    const [user, setUser] = useState(null);

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
    return user;
}