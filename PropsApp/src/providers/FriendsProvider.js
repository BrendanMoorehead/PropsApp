import AsyncStorage from '@react-native-async-storage/async-storage';
import { indexOf, set } from 'lodash'
import filter from "lodash.filter";
import { getAllUsernames } from '../service/dataService'
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
    getFriendRequests, 
    acceptFriendRequest, 
    rejectFriendRequest,
    sendFriendRequest,
    removeFriend,
    getFriendList,
    cancelFriendRequest
} from '../service/friendService';

const FriendsContext = createContext();

export const useFriends = () => useContext(FriendsContext);

export const FriendsProvider = ({ children }) => {
    //Active User States
    const [activeUID, setActiveUID] = useState(null);
    const [activeUsername, setActiveUsername] = useState(null);
    //Friends Provider States
    const [requests, setRequests] = useState([]);
    const [friendsList, setFriendList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchResults, setSearchResults] = useState([]);
    const [usernameList, setUsernameList] = useState([]);

    useEffect(() => {
        const fetchActiveUserData = async () => {
            try {
                setIsLoading(true);
                const userToken = await AsyncStorage.getItem("userToken");
                const username = await AsyncStorage.getItem("username");
                setActiveUID(userToken);
                setActiveUsername(username);
                return userToken;
            } catch (e) {
                throw new Error("Failed to fetch active user data.");
            } finally {
                setIsLoading(false);
            }
        }
        const fetchAdditionalData = async () =>{
            try{
                console.log("call");
                await fetchAllUsernames();
                await fetchFriendList();
                await fetchFriendRequests();
            } catch (e) {
                throw new Error ('Failed to fetch startup data: ' + e.message);
            }  finally {
                setIsLoading(false);
            }
        }
        fetchActiveUserData();
        if (activeUID){
            fetchAdditionalData(); 
        }
    }, [activeUID]);

    /**
     * Retrieves a list of all usernames in the database.
     */
    const fetchAllUsernames = async () => {
        try {
            setIsLoading(true);
            usernameArray = await getAllUsernames();
            setUsernameList(usernameArray);
        } catch (e) {
            throw new Error("Failed get inital list of usernames for search functionality.");
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Retrieves a list of requests for the logged in user.
     * TODO: Retrieve requests sent by the user.
     */
    const fetchFriendRequests = async () => {
        try {
            setIsLoading(true);
            if (activeUID){
            const requests = await getFriendRequests(activeUID); //Calls the Friend Service to get requests for the user.
            setRequests(requests);
            }
        } catch (e) {
            throw new Error("Failed to fetch friend requests." + e);
        } finally {
            setIsLoading(false);
        }
    } 
    /**
     * Retrieves the list of friends for the logged in user.
     */
    const fetchFriendList = async () => {
        try {
            setIsLoading(true);
            if (activeUID){
            const friendListArray = await getFriendList(activeUID);
            setFriendList(friendListArray);
            }
        } catch (e) {
            throw new Error("Failed to fetch friend list." + e);
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Accepts a friend request from a given user.
     * 
     * @param {*} senderUID The UID of the user who sent the request.
     */
    const handleRequestAccept = async (senderUID) => {
        try {
            setIsLoading(true);
            await acceptFriendRequest(activeUID, senderUID); //Adds the friend to both users lists.
            await fetchFriendList();
            await fetchFriendRequests();
        } catch (e) {
            throw new Error("Failed to accept friend request from: " + senderUID);
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Rejects a friend request from a given user.
     * 
     * @param {*} senderUID The UID of the user who sent the request.
     */
    const handleRequestReject = async (senderUID) => {
        try {
            setIsLoading(true);
            await rejectFriendRequest(activeUID, senderUID);
            await fetchFriendRequests();
        } catch (e) {
            throw new Error("Failed to reject friend request from: " + senderUID);
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Sends a friend request to a given user.
     * 
     * @param {*} receiverUID The UID of the user receiving the request.
     */
    const handleRequestSend = async (receiverUID, receiverUsername) => {
        try{
            setIsLoading(true);
            await sendFriendRequest(activeUID, receiverUID, activeUsername, receiverUsername);
            await fetchFriendRequests();
        } catch (e) {
            throw new Error("Failed to send a friend request to " + receiverUsername);
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Cancels a request sent to a given user.
     * 
     * @param {*} receiverUID The UID of the user receiving the request.
     */
     const handleRequestCancel = async (receiverUID,) => {
        try{
            setIsLoading(true);
            await cancelFriendRequest(activeUID, receiverUID);
            await fetchFriendRequests();
        } catch (e) {
            throw new Error("Failed to cancel friend request to " + receiverUID);
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Searches the list of usernames via a query.
     * 
     * @param {*} query The query for which to search by.
     */
    const handleSearch = (query) => {
        try{
            setIsLoading(true);
            const formattedQuery = query.toLowerCase();
            const filteredUsernames = filter(usernameList, (user) => {
              return contains(user, formattedQuery);
            });
            setSearchResults(filteredUsernames);
          } catch (e) {
            throw new Error("Search query failed.");
          } finally {
              setIsLoading(false);
          }
    }
    const contains = (user, query) => {
        const id = String(user.id).toLowerCase();
        return id !== activeUsername.toLowerCase() && id.includes(query);
    }
    
    /**
     * Removes a given friend from the active user's friend list.
     * 
     * @param {*} friendUID the UID of a friend on the active user's friend list.
     */
    const handleRemove = async (friendUID) => {
        try {
            setIsLoading(true);
            await removeFriend(activeUID, friendUID);
        } catch (e) {
            throw new Error("Failed to remove friend from friends list.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <FriendsContext.Provider 
        value={{requests, 
                friendsList, 
                isLoading, 
                searchResults,
                handleRemove,
                handleSearch,
                handleRequestSend,
                handleRequestReject,
                handleRequestAccept,
                usernameList,
                handleRequestCancel
                }}>
            {children}
        </FriendsContext.Provider>
    )
}