// Import custom authentication hook
import { useAuth } from '../hooks/useAuth';
import * as React from 'react';
// Import stacks
import UserStack from './userStack';
import AuthStack from './authStack';
import { SafeAreaView, ActivityIndicator, StyleSheet } from 'react-native';

export default function RootNavigation({user}) {
    if (user) {
        return <UserStack user={user}/>;
    }else{
        return <AuthStack/>;
    }
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});