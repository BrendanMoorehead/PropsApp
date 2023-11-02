// Import custom authentication hook
import { useAuth } from '../hooks/useAuth';
import * as React from 'react';
// Import stacks
import UserStack from './userStack';
import AuthStack from './authStack';
import UsernameScreen from '..//screens/Username'
import { SafeAreaView, ActivityIndicator, StyleSheet } from 'react-native';

export default function RootNavigation() {
    // Gets whether the user is logged in or not
    const {user, usernamePicked, loading} = useAuth();
    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
            </SafeAreaView>
        );
    }
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

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});