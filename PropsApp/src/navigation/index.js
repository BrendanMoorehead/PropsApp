// Import custom authentication hook
import { useAuth } from '../hooks/useAuth';
import * as React from 'react';
// Import stacks
import UserStack from './userStack';
import AuthStack from './authStack';
import UsernameScreen from '..//screens/Username'

export default function RootNavigation() {
    // Gets whether the user is logged in or not
    const {user, usernamePicked} = useAuth();
    // Returns the main stack if logged in, auth stack if not
    if (user) {
        if (usernamePicked) {
            return <UserStack/>;
        }else {
            return <UsernameScreen/>;
        }
    }else{
        return <AuthStack/>;
    }
}