import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { FIREBASE_AUTH, FIRESTORE_DB } from "../config/firebaseConfig";
import { setDoc, doc } from "firebase/firestore";
import { getUsernameFromUID } from "../service/dataService";
//Contains functions related to firebase authenication
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
        const response = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
        const uid = response.user.uid;
        const username = await getUsernameFromUID(uid);
        //Store the user's ID and username as tokens
        await AsyncStorage.setItem('userToken', uid);
        await AsyncStorage.setItem('username', username);
        return uid;
    } catch (error) {
        console.error(error);
        throw new Error("Login with email and password failed: " + error.message);
    }
}
/**
 * Creates a new user in firebase auth and adds the userID to async storage.
 * 
 * @param {*} email The user's account email.
 * @param {*} password The user's account password.
 * @param {*} username The user's username.
 * @returns The user ID of the user who was just created.
 * @throws {Error} if user account creation fails.
 */
export const signUpWithEmail = async (email, password, username) => {
    try{
        const response = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
        const uid = response.user.uid;
        await AsyncStorage.setItem('userToken', uid);
        await AsyncStorage.setItem('username', username);
        await setDoc(doc(FIRESTORE_DB, 'users', uid), {
            email: email,
            uid: uid,
        }, {merge:true});
        return uid;
    } catch (error){
        console.error(error);
        throw new Error("Registration with email and password failed: " + error.message);
    }
}

/**
 * Signs the user out and removes the user token from async storage.
 */
export const logoutUser = async () => {
    try {
        await signOut(FIREBASE_AUTH);
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('username');
    }catch {
        console.error(error);
        throw new Error("Logout failed: " + error.message);
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
    } catch (error) {
        console.error(error);
        return null;
    }
}