import React, { useEffect } from "react";
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

const auth = getAuth();

export function useAuth(){
    const [user, setUser] = useState();

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