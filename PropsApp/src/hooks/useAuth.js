import { useEffect, useState } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { FIREBASE_AUTH } from "../config/firebaseConfig";
import { doc, getDoc } from 'firebase/firestore';
import { FIRESTORE_DB } from "../config/firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';
const auth = FIREBASE_AUTH;

export function useAuth(){
    const [user, setUser] = useState(null);
    const [usernamePicked, setUsernamePicked] = useState(false);

    useEffect(() => {
        const getUsername = async () => {
            
            //Get if username 
            try{
                const uid = await AsyncStorage.getItem('UserUID');
                if (uid){
                    const docRef = doc(FIRESTORE_DB, 'users', uid);
                    const docSnap = await getDoc(docRef);
                    
                    if (docSnap.exists()){
                        console.log(docSnap.data());
                        const data = docSnap.data();
                        if (data.username !== undefined){
                            AsyncStorage.setItem("Username", data.username);
                            setUsernamePicked(true);
                        }
                    }
                    else{
                        console.log("No Document Found");
                    }
                }
            } catch(error){
                console.error("Error: ", error);
            }
        }

        const unsubFromAuthStateChanged = onAuthStateChanged(auth, (user) => {
            if (user){
                setUser(user);
                getUsername();
            } else {
                setUser(null);
            }
        })
        return unsubFromAuthStateChanged
    }, []);
    return {user, usernamePicked};
}