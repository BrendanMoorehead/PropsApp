// Import custom authentication hook
import * as React from 'react';
// Import stacks
import UserStack from './userStack';
import AuthStack from './authStack';

export default function RootNavigation({user}) {
    if (user) {
        return <UserStack user={user}/>;
    }else{
        return <AuthStack/>;
    }
}
