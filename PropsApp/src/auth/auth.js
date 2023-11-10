import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { FIREBASE_AUTH } from "../config/firebaseConfig"
//Contains functions related to firebase authenication

const auth = getAuth();
/**
 * Logs in the user and adds the userID to async storage.
 * 
 * @param {*} email The user's account email.
 * @param {*} password The user's account password.
 * @returns The user id of the user who was just logged in.
 * @throws {Error} if sign in fails.
 */
export const signInWithEmail = async (email, password) => {
    try {
        const response = await signInWithEmailAndPassword(auth, email, password);
        const uid = response.user.uid;
        //Store the user's ID as the persistent token
        await AsyncStorage.setItem('userToken', uid);
        return uid;
    } catch (e) {
        console.error(e);
        throw new Error("Login with email and password failed: " + e.message);
    }
}

/**
 * Signs the user out and removes the user token from async storage.
 */
export const signOut = async () => {
    try {
        await signOut(auth);
        await AsyncStorage.removeItem('userToken');
    }catch {
        console.error(e);
        throw new Error("Logout failed: " + e.message);
    }
}

/**
 * Gets the token for the user who is currently logged in.
 * @returns The user token if the user is logged in, otherwise null.
 */
export const getCurrentUser = async () => {
    try {
        const userToken = await AsyncStorage.getItem('userToken');
        return userToken ? auth.currentUser : null;
    } catch (e) {
        console.error(e);
        return null;
    }
}